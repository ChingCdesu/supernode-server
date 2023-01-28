#include "sn_utils.h"

static void close_tcp_connection(n2n_sn_t *sss, n2n_tcp_connection_t *conn) {

  struct sn_community *comm, *tmp_comm;
  struct peer_info *edge, *tmp_edge;

  if (!conn)
    return;

  // find peer by file descriptor
  HASH_ITER(hh, sss->communities, comm, tmp_comm) {
    HASH_ITER(hh, comm->edges, edge, tmp_edge) {
      if (edge->socket_fd == conn->socket_fd) {
        // remove peer
        HASH_DEL(comm->edges, edge);
        free(edge);
        goto close_conn; /* break - level 2 */
      }
    }
  }

close_conn:
  // close the connection
  shutdown(conn->socket_fd, SHUT_RDWR);
  closesocket(conn->socket_fd);
  // forget about the connection, will be deleted later
  conn->inactive = 1;
}

/* *************************************************** */

// generate shared secrets for user authentication; can be done only after
// federation name is known (-F) and community list completely read (-c)
static void calculate_shared_secrets(n2n_sn_t *sss) {

  struct sn_community *comm, *tmp_comm;
  sn_user_t *user, *tmp_user;

  traceEvent(TRACE_INFO,
             "started shared secrets calculation for edge authentication");

  generate_private_key(sss->private_key,
                       sss->federation->community +
                           1); /* skip '*' federation leading character */
  HASH_ITER(hh, sss->communities, comm, tmp_comm) {
    if (comm->is_federation) {
      continue;
    }
    HASH_ITER(hh, comm->allowed_users, user, tmp_user) {
      // calculate common shared secret (ECDH)
      generate_shared_secret(user->shared_secret, sss->private_key,
                             user->public_key);
      // prepare for use as key
      user->shared_secret_ctx =
          (he_context_t *)calloc(1, sizeof(speck_context_t));
      speck_init((speck_context_t **)&user->shared_secret_ctx,
                 user->shared_secret, 128);
    }
  }

  traceEvent(TRACE_NORMAL, "calculated shared secrets for edge authentication");
}

// calculate dynamic keys
static void calculate_dynamic_keys(n2n_sn_t *sss) {

  struct sn_community *comm, *tmp_comm = NULL;

  traceEvent(TRACE_INFO, "calculating dynamic keys");
  HASH_ITER(hh, sss->communities, comm, tmp_comm) {
    // skip federation
    if (comm->is_federation) {
      continue;
    }

    // calculate dynamic keys if this is a user/pw auth'ed community
    if (comm->allowed_users) {
      calculate_dynamic_key(
          comm->dynamic_key,                      /* destination */
          sss->dynamic_key_time,                  /* time - same for all */
          (uint8_t *)comm->community,             /* community name */
          (uint8_t *)sss->federation->community); /* federation name */
      packet_header_change_dynamic_key(comm->dynamic_key,
                                       &(comm->header_encryption_ctx_dynamic),
                                       &(comm->header_iv_ctx_dynamic));
      traceEvent(TRACE_DEBUG, "calculated dynamic key for community '%s'",
                 comm->community);
    }
  }
}

// send RE_REGISTER_SUPER to all edges from user/pw auth'ed communites
static void send_re_register_super(n2n_sn_t *sss) {

  struct sn_community *comm, *tmp_comm = NULL;
  struct peer_info *edge, *tmp_edge = NULL;
  n2n_common_t cmn;
  uint8_t rereg_buf[N2N_SN_PKTBUF_SIZE];
  size_t encx = 0;
  n2n_sock_str_t sockbuf;

  HASH_ITER(hh, sss->communities, comm, tmp_comm) {
    if (comm->is_federation) {
      continue;
    }

    // send RE_REGISTER_SUPER to edges if this is a user/pw auth community
    if (comm->allowed_users) {
      // prepare
      cmn.ttl = N2N_DEFAULT_TTL;
      cmn.pc = n2n_re_register_super;
      cmn.flags = N2N_FLAGS_FROM_SUPERNODE;
      memcpy(cmn.community, comm->community, N2N_COMMUNITY_SIZE);

      HASH_ITER(hh, comm->edges, edge, tmp_edge) {
        // encode
        encx = 0;
        encode_common(rereg_buf, &encx, &cmn);

        // send
        traceEvent(TRACE_DEBUG, "send RE_REGISTER_SUPER to %s",
                   sock_to_cstr(sockbuf, &(edge->sock)));

        packet_header_encrypt(rereg_buf, encx, encx,
                              comm->header_encryption_ctx_dynamic,
                              comm->header_iv_ctx_dynamic, time_stamp());

        /* sent = */ sendto_peer(sss, edge, rereg_buf, encx);
      }
    }
  }
}

/** Send a datagram to a file descriptor socket.
 *
 *    @return -1 on error otherwise number of bytes sent
 */
static ssize_t sendto_fd(n2n_sn_t *sss, SOCKET socket_fd,
                         const struct sockaddr *socket, const uint8_t *pktbuf,
                         size_t pktsize) {

  ssize_t sent = 0;
  n2n_tcp_connection_t *conn;

  sent = sendto(socket_fd, (void *)pktbuf, pktsize, 0 /* flags */, socket,
                sizeof(struct sockaddr_in));

  if ((sent <= 0) && (errno)) {
    char *c = strerror(errno);
    traceEvent(TRACE_ERROR, "sendto failed (%d) %s", errno, c);
#ifdef WIN32
    traceEvent(TRACE_ERROR, "WSAGetLastError(): %u", WSAGetLastError());
#endif
    // if the erroneous connection is tcp, i.e. not the regular sock...
    if ((socket_fd >= 0) && (socket_fd != sss->sock)) {
      // ...forget about the corresponding peer and the connection
      HASH_FIND_INT(sss->tcp_connections, &socket_fd, conn);
      close_tcp_connection(sss, conn);
      return -1;
    }
  } else {
    traceEvent(TRACE_DEBUG, "sendto sent=%d to ", (signed int)sent);
  }

  return sent;
}

/** Send a datagram to a network order socket of type struct sockaddr.
 *
 *    @return -1 on error otherwise number of bytes sent
 */
static ssize_t sendto_sock(n2n_sn_t *sss, SOCKET socket_fd,
                           const struct sockaddr *socket, const uint8_t *pktbuf,
                           size_t pktsize) {

  ssize_t sent = 0;
  int value = 0;

  // if the connection is tcp, i.e. not the regular sock...
  if ((socket_fd >= 0) && (socket_fd != sss->sock)) {

    setsockopt(socket_fd, IPPROTO_TCP, TCP_NODELAY, &value, sizeof(value));
    value = 1;
#ifdef LINUX
    setsockopt(socket_fd, IPPROTO_TCP, TCP_CORK, &value, sizeof(value));
#endif

    // prepend packet length...
    uint16_t pktsize16 = htobe16(pktsize);
    sent = sendto_fd(sss, socket_fd, socket, (uint8_t *)&pktsize16,
                     sizeof(pktsize16));

    if (sent <= 0)
      return -1;
    // ...before sending the actual data
  }

  sent = sendto_fd(sss, socket_fd, socket, pktbuf, pktsize);

  // if the connection is tcp, i.e. not the regular sock...
  if ((socket_fd >= 0) && (socket_fd != sss->sock)) {
    value = 1; /* value should still be set to 1 */
    setsockopt(socket_fd, IPPROTO_TCP, TCP_NODELAY, &value, sizeof(value));
#ifdef LINUX
    value = 0;
    setsockopt(socket_fd, IPPROTO_TCP, TCP_CORK, &value, sizeof(value));
#endif
  }

  return sent;
}

/** Send a datagram to a peer whose destination socket is embodied in its sock
 * field of type n2n_sock_t. It calls sendto_sock to do the final send.
 *
 *    @return -1 on error otherwise number of bytes sent
 */
static ssize_t sendto_peer(n2n_sn_t *sss, const struct peer_info *peer,
                           const uint8_t *pktbuf, size_t pktsize) {

  n2n_sock_str_t sockbuf;

  if (AF_INET == peer->sock.family) {

    // network order socket
    struct sockaddr_in socket;
    fill_sockaddr((struct sockaddr *)&socket, sizeof(socket), &(peer->sock));

    traceEvent(TRACE_DEBUG, "sent %lu bytes to [%s]", pktsize,
               sock_to_cstr(sockbuf, &(peer->sock)));

    return sendto_sock(sss,
                       (peer->socket_fd >= 0) ? peer->socket_fd : sss->sock,
                       (const struct sockaddr *)&socket, pktbuf, pktsize);
  } else {
    /* AF_INET6 not implemented */
    errno = EAFNOSUPPORT;
    return -1;
  }
}

// provides the current / a new local auth token
// REVISIT: behavior should depend on some local auth scheme setting (to be
// implemented)
static int get_local_auth(n2n_sn_t *sss, n2n_auth_t *auth) {

  // n2n_auth_simple_id scheme
  memcpy(auth, &(sss->auth), sizeof(n2n_auth_t));

  return 0;
}

static int re_register_and_purge_supernodes(n2n_sn_t *sss,
                                            struct sn_community *comm,
                                            time_t *p_last_re_reg_and_purge,
                                            time_t now, uint8_t forced) {

  time_t time;
  struct peer_info *peer, *tmp;

  if (!forced) {
    if ((now - (*p_last_re_reg_and_purge)) < RE_REG_AND_PURGE_FREQUENCY) {
      return 0;
    }

    // purge long-time-not-seen supernodes
    purge_expired_nodes(&(comm->edges), sss->sock, &sss->tcp_connections,
                        p_last_re_reg_and_purge, RE_REG_AND_PURGE_FREQUENCY,
                        LAST_SEEN_SN_INACTIVE);
  }

  if (comm != NULL) {
    HASH_ITER(hh, comm->edges, peer, tmp) {

      time = now - peer->last_seen;

      if (!forced) {
        if (time <= LAST_SEEN_SN_ACTIVE) {
          continue;
        }
      }

      /* re-register (send REGISTER_SUPER) */
      uint8_t pktbuf[N2N_PKT_BUF_SIZE] = {0};
      size_t idx;
      /* ssize_t sent; */
      n2n_common_t cmn;
      n2n_REGISTER_SUPER_t reg;
      n2n_sock_str_t sockbuf;

      memset(&cmn, 0, sizeof(cmn));
      memset(&reg, 0, sizeof(reg));

      cmn.ttl = N2N_DEFAULT_TTL;
      cmn.pc = n2n_register_super;
      cmn.flags = N2N_FLAGS_FROM_SUPERNODE;
      memcpy(cmn.community, comm->community, N2N_COMMUNITY_SIZE);

      reg.cookie = n2n_rand();
      peer->last_cookie = reg.cookie;

      reg.dev_addr.net_addr = ntohl(peer->dev_addr.net_addr);
      reg.dev_addr.net_bitlen = mask2bitlen(ntohl(peer->dev_addr.net_bitlen));
      get_local_auth(sss, &(reg.auth));

      reg.key_time = sss->dynamic_key_time;

      idx = 0;
      encode_mac(reg.edgeMac, &idx, sss->mac_addr);

      idx = 0;
      encode_REGISTER_SUPER(pktbuf, &idx, &cmn, &reg);

      traceEvent(TRACE_DEBUG, "send REGISTER_SUPER to %s",
                 sock_to_cstr(sockbuf, &(peer->sock)));

      packet_header_encrypt(pktbuf, idx, idx,
                            comm->header_encryption_ctx_static,
                            comm->header_iv_ctx_static, time_stamp());

      /* sent = */ sendto_peer(sss, peer, pktbuf, idx);
    }
  }

  return 0; /* OK */
}
