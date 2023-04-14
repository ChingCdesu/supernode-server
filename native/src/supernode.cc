#include "supernode.h"
#include <exception>

SupernodeOption::SupernodeOption(const Napi::Object &options) {
  if (options["port"].IsNumber()) {
    this->port = options["port"].As<Napi::Number>().Uint32Value();
  }
  if (options["federationName"].IsString()) {
    this->federationName =
        options["federationName"].As<Napi::String>().Utf8Value();
  }
  if (options["disableSpoofingProtection"].IsBoolean()) {
    this->disableSpoofingProtection =
        options["disableSpoofingProtection"].As<Napi::Boolean>().Value();
  }
  if (options["subnetRange"].IsString()) {
    this->subnetRange = options["subnetRange"].As<Napi::String>().Utf8Value();
  }
  if (options["federationParent"].IsString()) {
    this->federationParent =
        options["federationParent"].As<Napi::String>().Utf8Value();
  }
}

CommunityDevice::CommunityDevice(const std::string &name,
                                 const std::string &publicKey)
    : name(name), publicKey(publicKey) {}

CommunityDevice::CommunityDevice(const Napi::Object &device) {
  if (!device["name"].IsString()) {
    throw std::invalid_argument("\'device.name\' must be \'string\'");
  }
  if (!device["publicKey"].IsString()) {
    throw std::invalid_argument("\'device.publicKey\' must be \'string\'");
  }

  this->name = device["name"].As<Napi::String>().Utf8Value();
  this->publicKey = device["publicKey"].As<Napi::String>().Utf8Value();
}

CommunityOption::CommunityOption(const Napi::Object &options) {
  if (!options["name"].IsString()) {
    throw std::invalid_argument("\'community.name\' must be \'string\'");
  }
  if (options["subnet"].IsString()) {
    this->subnet = options["subnet"].As<Napi::String>().Utf8Value();
  }
  if (options["encryption"].IsBoolean()) {
    this->encryption = options["encryption"].As<Napi::Boolean>().Value();
  }

  this->name = options["name"].As<Napi::String>().Utf8Value();
  const auto devices = options["devices"].As<Napi::Array>();
  if (!options["devices"].IsUndefined()) {
    if (!options["devices"].IsArray()) {
      throw std::invalid_argument("\'community.devices\' must be \'array\'");
    }
    for (auto index = 0; index < devices.Length(); ++index) {
      if (!devices[index].IsObject()) {
        throw std::invalid_argument(
            "\'community.devicess[%d]\' must be \'object\'");
      }
      this->devices.emplace_back(devices[index].As<Napi::Object>());
    }
  }
}

Supernode::Supernode() : Supernode(SupernodeOption()) {}

Supernode::Supernode(const SupernodeOption &options) : _worker() {
  sn_init_defaults(&_sn);
  _sn.daemon = 0;
  _sn.lport = options.port;
  setTraceLevel(1); // TRACE_WARNING & TRACE_ERROR
  traceEvent(TRACE_INFO, "\tUDP service port: %u", _sn.lport);
  snprintf(_sn.federation->community, N2N_COMMUNITY_SIZE - 1, "*%s",
           options.federationName.c_str());
  _sn.federation->community[N2N_COMMUNITY_SIZE - 1] = '\0';
  traceEvent(TRACE_INFO, "\tFederation name: %s", _sn.federation->community);
  if (!strcmp(_sn.federation->community, FEDERATION_NAME)) {
    traceEvent(TRACE_WARNING,
               "using default federation name; FOR TESTING ONLY, usage of a "
               "custom federation name is highly recommended!");
  }
  if (!options.federationParent.empty()) {
    n2n_sock_t *socket;
    struct peer_info *anchor_sn;
    size_t length;
    int rv = -1;
    int skip_add;
    char fp[N2N_EDGE_SN_HOST_SIZE];
    strcpy(fp, options.federationParent.c_str());
    char *double_column = strchr(fp, ':');

    length = strlen(fp);
    if (length >= N2N_EDGE_SN_HOST_SIZE) {
      traceEvent(TRACE_ERROR,
                 "size of 'federationParent' argument too long: %zu; maximum "
                 "size is %d",
                 length, N2N_EDGE_SN_HOST_SIZE);
      return;
    }

    if (!double_column) {
      traceEvent(TRACE_ERROR,
                 "invalid 'federationParent' format, missing port");
      return;
    }

    socket = (n2n_sock_t *)calloc(1, sizeof(n2n_sock_t));
    rv = supernode2sock(socket, fp);

    if (rv < -2) { /* we accept resolver failure as it might resolve later */
      traceEvent(TRACE_WARNING, "invalid supernode parameter");
      free(socket);
      return;
    }

    if (_sn.federation != NULL) {
      skip_add = SN_ADD;
      anchor_sn = add_sn_to_list_by_mac_or_sock(&(_sn.federation->edges),
                                                socket, null_mac, &skip_add);

      if (anchor_sn != NULL) {
        anchor_sn->ip_addr =
            reinterpret_cast<char *>(calloc(1, N2N_EDGE_SN_HOST_SIZE));
        if (anchor_sn->ip_addr) {
          strncpy(anchor_sn->ip_addr, fp, N2N_EDGE_SN_HOST_SIZE - 1);
          memcpy(&(anchor_sn->sock), socket, sizeof(n2n_sock_t));
          memcpy(anchor_sn->mac_addr, null_mac, sizeof(n2n_mac_t));
          anchor_sn->purgeable = SN_UNPURGEABLE;
          anchor_sn->last_valid_time_stamp = initial_time_stamp();
        }
      }
    }
    free(socket);
    traceEvent(TRACE_INFO, "\tFederation parent: %s",
               options.federationParent.c_str());
  }

  _sn.override_spoofing_protection = options.disableSpoofingProtection ? 1 : 0;
  traceEvent(TRACE_INFO, "\tDisable spoofing protection: %s",
             options.disableSpoofingProtection ? "yes" : "no");
  if (_sn.override_spoofing_protection) {
    traceEvent(
        TRACE_WARNING,
        "disabled MAC and IP address spoofing protection; FOR TESTING "
        "ONLY, usage of user-password authentication recommended instead!");
  }
  applySubnetRange(options.subnetRange);
}

Supernode::Supernode(const Napi::Object &options)
    : Supernode(SupernodeOption(options)) {}

Napi::Object Supernode::toObject(Napi::Env env) {
  auto obj = Napi::Object::New(env);
  dec_ip_bit_str_t start_ip_bit_str = {'\0'}, end_ip_bit_str = {'\0'};
  char subnetBuffer[50];
  /* -------------- supernode federation key part -------------- */
  n2n_private_public_key_t prv; /* 32 bytes private key */
  n2n_private_public_key_t bin; /* 32 bytes public key binary output buffer */
  char asc[44]; /* 43 bytes + 0-terminator ascii string output */

  obj.Set("port", _sn.lport);
  obj.Set("startTime", _sn.start_time);
  obj.Set("version", _sn.version);
  obj.Set("communityCount", HASH_COUNT(_sn.communities));
  if (_sn.federation->edges) {
    obj.Set("federationParent", _sn.federation->edges->ip_addr);
  }
  if (strcmp(_sn.federation->community, FEDERATION_NAME)) {
    auto federationName = _sn.federation->community + 1; /* skip '*' symbol */
    obj.Set("federationName", federationName);
    generate_private_key(prv, federationName);
    generate_public_key(bin, prv);
    memset(prv, 0, sizeof(prv));
    bin_to_ascii(asc, bin, sizeof(bin));
    obj.Set("publicKey", asc);
  }
  obj.Set("disableSpoofingProtection", (bool)_sn.override_spoofing_protection);
  sprintf(subnetBuffer, "%s-%s",
          ip_subnet_to_str(start_ip_bit_str, &_sn.min_auto_ip_net),
          ip_subnet_to_str(end_ip_bit_str, &_sn.max_auto_ip_net));
  obj.Set("subnetRange", subnetBuffer);
  return obj;
}

Napi::Array Supernode::getCommunities(Napi::Env env) {
  struct sn_community *community, *tmp;
  struct peer_info *peer, *tmpPeer;
  sn_user_t *device, *tmpDevice;
  macstr_t mac_buf;
  n2n_sock_str_t sockbuf;
  dec_ip_bit_str_t ip_bit_str = {'\0'};
  char ascii_public_key[(N2N_PRIVATE_PUBLIC_KEY_SIZE * 8 + 5) / 6 + 1];

  auto arr = Napi::Array::New(env);
  auto index = 0;
  HASH_ITER(hh, _sn.communities, community, tmp) {
    auto commObj = Napi::Object::New(env);
    // load peers
    auto peersArr = Napi::Array::New(env);
    auto peersIndex = 0;
    HASH_ITER(hh, community->edges, peer, tmpPeer) {
      auto peerObj = Napi::Object::New(env);
      peerObj.Set("name", reinterpret_cast<const char *>(peer->dev_desc));
      if (peer->dev_addr.net_addr != 0) {
        peerObj.Set("ip", ip_subnet_to_str(ip_bit_str, &peer->dev_addr));
      }
      if (!is_null_mac(peer->mac_addr)) {
        peerObj.Set("mac", macaddr_str(mac_buf, peer->mac_addr));
      }
      peerObj.Set("protocol",
                  ((peer->socket_fd >= 0) && (peer->socket_fd != _sn.sock))
                      ? "TCP"
                      : "UDP");
      peerObj.Set("lastSeen", peer->last_seen);
      peersArr.Set(peersIndex++, peerObj);
    }
    commObj.Set("peers", peersArr);
    auto devicesArr = Napi::Array::New(env);
    auto devicesIndex = 0;
    HASH_ITER(hh, community->allowed_users, device, tmpDevice) {
      auto deviceObj = Napi::Object::New(env);
      deviceObj.Set("name", reinterpret_cast<char *>(device->name));
      bin_to_ascii(ascii_public_key, device->public_key,
                   sizeof(device->public_key));
      deviceObj.Set("publicKey", ascii_public_key);
      devicesArr.Set(devicesIndex++, deviceObj);
    }
    commObj.Set("devices", devicesArr);
    commObj.Set("name", community->community);
    if (community->auto_ip_net.net_addr != 0) {
      commObj.Set("subnet",
                  ip_subnet_to_str(ip_bit_str, &community->auto_ip_net));
    }
    arr.Set(index++, commObj);
  }
  return arr;
}

void Supernode::start() {
  _sn.sock = open_socket(_sn.lport, INADDR_ANY, 0 /* UDP */);
  if (-1 == _sn.sock) {
    throw std::runtime_error("failed open UDP port");
  }
  sn_init(&_sn);
  _keep_running = 1;
  _sn.keep_running = &_keep_running;
  _worker = std::thread([&] { _exit_code = run_sn_loop(&_sn); });
  onCreated(this);
}

void Supernode::loadCommunities(const Napi::Array &communities) {
  std::vector<CommunityOption> vCommunities;
  for (auto index = 0; index < communities.Length(); ++index) {
    if (!communities[index].IsObject()) {
      traceEvent(TRACE_WARNING,
                 "\'communities[%d]\' must be \'object\', skipped", index);
      continue;
    }
    vCommunities.emplace_back(communities[index].As<Napi::Object>());
  }
  applyCommunities(vCommunities);
}

void Supernode::applySubnetRange(const std::string &subnetStr) {
  dec_ip_str_t ip_min_str = {'\0'};
  dec_ip_str_t ip_max_str = {'\0'};
  in_addr_t net_min, net_max;
  uint8_t bitlen;
  uint32_t mask;
  char str[50];
  strcpy(str, subnetStr.c_str());
  if (sscanf(str, "%15[^\\-]-%15[^/]/%hhu", ip_min_str, ip_max_str, &bitlen) !=
      3) {
    traceEvent(TRACE_WARNING, "bad net-net/bit format '%s'.", str);
    return;
  }

  net_min = inet_addr(ip_min_str);
  net_max = inet_addr(ip_max_str);
  mask = bitlen2mask(bitlen);
  if ((net_min == (in_addr_t)(-1)) || (net_min == INADDR_NONE) ||
      (net_min == INADDR_ANY) || (net_max == (in_addr_t)(-1)) ||
      (net_max == INADDR_NONE) || (net_max == INADDR_ANY) ||
      (ntohl(net_min) > ntohl(net_max)) || ((ntohl(net_min) & ~mask) != 0) ||
      ((ntohl(net_max) & ~mask) != 0)) {
    traceEvent(
        TRACE_WARNING,
        "bad network range '%s...%s/%u' in '%s', defaulting to '%s...%s/%d'",
        ip_min_str, ip_max_str, bitlen, str, N2N_SN_MIN_AUTO_IP_NET_DEFAULT,
        N2N_SN_MAX_AUTO_IP_NET_DEFAULT, N2N_SN_AUTO_IP_NET_BIT_DEFAULT);
    return;
  }

  if ((bitlen > 30) || (bitlen == 0)) {
    traceEvent(TRACE_WARNING,
               "bad prefix '%hhu' in '%s', defaulting to '%s...%s/%d'", bitlen,
               str, N2N_SN_MIN_AUTO_IP_NET_DEFAULT,
               N2N_SN_MAX_AUTO_IP_NET_DEFAULT, N2N_SN_AUTO_IP_NET_BIT_DEFAULT);
    return;
  }

  traceEvent(TRACE_INFO, "Subnet Range: %s", subnetStr.c_str());

  _sn.min_auto_ip_net.net_addr = ntohl(net_min);
  _sn.min_auto_ip_net.net_bitlen = bitlen;
  _sn.max_auto_ip_net.net_addr = ntohl(net_max);
  _sn.max_auto_ip_net.net_bitlen = bitlen;
}

void Supernode::applyCommunities(
    const std::vector<CommunityOption> &communities) {
  sn_user_t *device, *tmp_device;
  n2n_private_public_key_t public_key;
  char ascii_public_key[(N2N_PRIVATE_PUBLIC_KEY_SIZE * 8 + 5) / 6 + 1];

  struct sn_community *comm, *tmp_comm;
  struct peer_info *edge, *tmp_edge;
  node_supernode_association_t *assoc, *tmp_assoc;
  n2n_tcp_connection_t *conn;
  struct sn_community_regular_expression *re, *tmp_re;

  time_t any_time = 0;

  traceEvent(TRACE_INFO, "loading communities");
  // reset data structures ------------------------------

  // send RE_REGISTER_SUPER to all edges from user/pw auth communites, this is
  // safe because follow-up REGISTER_SUPER cannot be handled before this
  // function ends
  send_re_register_super(&_sn);

  // remove communities (not: federation)
  HASH_ITER(hh, _sn.communities, comm, tmp_comm) {
    if (comm->is_federation) {
      continue;
    }

    // remove all edges from community
    HASH_ITER(hh, comm->edges, edge, tmp_edge) {
      // remove all edge associations (with other supernodes)
      HASH_ITER(hh, comm->assoc, assoc, tmp_assoc) {
        HASH_DEL(comm->assoc, assoc);
        free(assoc);
      }

      // close TCP connections, if any (also causes reconnect)
      // and delete edge from list
      if ((edge->socket_fd != _sn.sock) && (edge->socket_fd >= 0)) {
        HASH_FIND_INT(_sn.tcp_connections, &(edge->socket_fd), conn);
        close_tcp_connection(&_sn, conn); /* also deletes the edge */
      } else {
        HASH_DEL(comm->edges, edge);
        free(edge);
      }
    }

    // remove allowed users from community
    HASH_ITER(hh, comm->allowed_users, device, tmp_device) {
      free(device->shared_secret_ctx);
      HASH_DEL(comm->allowed_users, device);
      free(device);
    }

    // remove community
    HASH_DEL(_sn.communities, comm);
    if (NULL != comm->header_encryption_ctx_static) {
      // remove header encryption keys
      free(comm->header_encryption_ctx_static);
      free(comm->header_iv_ctx_static);
      free(comm->header_encryption_ctx_dynamic);
      free(comm->header_iv_ctx_dynamic);
    }
    free(comm);
  }

  // remove all regular expressions for allowed communities
  HASH_ITER(hh, _sn.rules, re, tmp_re) {
    HASH_DEL(_sn.rules, re);
    free(re);
  }

  // prepare reading data -------------------------------

  // new key_time for all communities, requires dynamic keys to be recalculated
  // (see further below), and  edges to re-register (see above) and ...
  _sn.dynamic_key_time = time(NULL);
  // ... federated supernodes to re-register
  re_register_and_purge_supernodes(&_sn, _sn.federation, &any_time, any_time,
                                   1 /* forced */);
  for (auto it = communities.begin(); it != communities.end(); ++it) {
    dec_ip_str_t ip_str;
    uint8_t bitlen;
    in_addr_t net;
    uint32_t mask;
    auto cmn_str = it->name.c_str();
    auto net_str = it->subnet.c_str();
    comm = new struct sn_community();
    comm_init(comm, const_cast<char *>(cmn_str));
    comm->purgeable = COMMUNITY_UNPURGEABLE;
    comm->header_encryption = HEADER_ENCRYPTION_UNKNOWN;
    packet_header_setup_key(
        comm->community, &comm->header_encryption_ctx_static,
        &comm->header_encryption_ctx_dynamic, &comm->header_iv_ctx_static,
        &comm->header_iv_ctx_dynamic);
    HASH_ADD_STR(_sn.communities, community, comm);
    traceEvent(TRACE_NORMAL, "added allowed community '%s'",
               (char *)comm->community);
    bool has_net = !it->subnet.empty();
    if (has_net) {
      // has sub-network address
      if (sscanf(it->subnet.c_str(), "%15[^/]/%hhu", ip_str, &bitlen) != 2) {
        traceEvent(TRACE_WARNING,
                   "bad net/bit format '%s' for community '%c', ignoring",
                   net_str, cmn_str);
        has_net = 0;
      }
      net = inet_addr(ip_str);
      mask = bitlen2mask(bitlen);
      if ((net == (in_addr_t)(-1)) || (net == INADDR_NONE) ||
          (net == INADDR_ANY) || ((ntohl(net) & ~mask) != 0)) {
        traceEvent(TRACE_WARNING,
                   "bad network '%s/%u' in '%s' for community '%s', ignoring",
                   ip_str, bitlen, net_str, cmn_str);
        has_net = 0;
      }
      if ((bitlen > 30) || (bitlen == 0)) {
        traceEvent(TRACE_WARNING,
                   "bad prefix '%hhu' in '%s' for community '%s', ignoring",
                   bitlen, net_str, cmn_str);
        has_net = 0;
      }
    }
    if (has_net) {
      comm->auto_ip_net.net_addr = ntohl(net);
      comm->auto_ip_net.net_bitlen = bitlen;
      traceEvent(TRACE_NORMAL, "assigned sub-network %s/%u to community '%s'",
                 inet_ntoa(*(struct in_addr *)&net),
                 comm->auto_ip_net.net_bitlen, comm->community);
    } else {
      assign_one_ip_subnet(&_sn, comm);
    }
    for (auto uit = it->devices.begin(); uit != it->devices.end(); ++uit) {
      device = (sn_user_t *)calloc(1, sizeof(sn_user_t));
      memcpy(device->name, uit->name.c_str(), sizeof(device->name));
      ascii_to_bin(public_key, const_cast<char *>(uit->publicKey.c_str()));
      memcpy(device->public_key, public_key, sizeof(public_key));
      HASH_ADD(hh, comm->allowed_users, public_key,
               sizeof(n2n_private_public_key_t), device);
      traceEvent(TRACE_NORMAL,
                 "added device '%s' with public key '%s' to community '%s'",
                 device->name, uit->publicKey.c_str(), comm->community);
      comm->header_encryption = HEADER_ENCRYPTION_ENABLED;
      packet_header_setup_key(
          comm->community, &(comm->header_encryption_ctx_static),
          &(comm->header_encryption_ctx_dynamic), &(comm->header_iv_ctx_static),
          &(comm->header_iv_ctx_dynamic));
    }
    if (comm->header_encryption == HEADER_ENCRYPTION_UNKNOWN) {
      comm->header_encryption =
          it->encryption ? HEADER_ENCRYPTION_ENABLED : HEADER_ENCRYPTION_NONE;
    }
  }
  // calculate allowed user's shared secrets (shared with federation)
  calculate_shared_secrets(&_sn);

  // calculcate communties' dynamic keys
  calculate_dynamic_keys(&_sn);

  // no new communities will be allowed
  _sn.lock_communities = 1;
}

void Supernode::stop() {
  if (_worker.joinable()) {
    _keep_running = 0;
    _worker.join();
    sn_term(&_sn);
    onReleased();
  }
}

Supernode::~Supernode() { stop(); }
