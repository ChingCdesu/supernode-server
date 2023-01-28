#pragma once

extern "C" {
#include "n2n.h"
}

static int re_register_and_purge_supernodes (n2n_sn_t *sss, struct sn_community *comm, time_t *p_last_re_reg_and_purge, time_t now, uint8_t forced);

static void close_tcp_connection(n2n_sn_t *sss, n2n_tcp_connection_t *conn);

static ssize_t sendto_peer(n2n_sn_t *sss, const struct peer_info *peer,
                           const uint8_t *pktbuf, size_t pktsize);

static void send_re_register_super(n2n_sn_t *sss);

static void calculate_shared_secrets (n2n_sn_t *sss);

static void calculate_dynamic_keys (n2n_sn_t *sss);
