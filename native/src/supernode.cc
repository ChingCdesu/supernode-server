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

CommunityUser::CommunityUser(const std::string &name,
                             const std::string &publicKey)
    : name(name), publicKey(publicKey) {}

CommunityUser::CommunityUser(const Napi::Object &user) {
  if (!user["name"].IsString()) {
    throw std::invalid_argument("\'user.name\' must be string");
  }
  if (!user["publicKey"].IsString()) {
    throw std::invalid_argument("\'user.publicKey\' must be string");
  }

  this->name = user["name"].As<Napi::String>().Utf8Value();
  this->publicKey = user["publicKey"].As<Napi::String>().Utf8Value();
}

CommunityOption::CommunityOption(const Napi::Object &options) {
  // TODO: parse CommunityOption from JsObject
}

Supernode::Supernode() : Supernode(SupernodeOption()) {}

Supernode::Supernode(const SupernodeOption &options) : _worker() {
  sn_init_defaults(&_sn);
  traceEvent(TRACE_NORMAL, "config:");
  _sn.daemon = 0;
  _sn.lport = options.port;
  traceEvent(TRACE_NORMAL, "\tUDP service port: %u", _sn.lport);
  snprintf(_sn.federation->community, N2N_COMMUNITY_SIZE - 1, "*%s",
           options.federationName.c_str());
  _sn.federation->community[N2N_COMMUNITY_SIZE - 1] = '\0';
  traceEvent(TRACE_NORMAL, "\tFederation name: %s", _sn.federation->community);
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
    traceEvent(TRACE_NORMAL, "\tFederation parent: %s",
               options.federationParent.c_str());
  }

  _sn.override_spoofing_protection = options.disableSpoofingProtection ? 1 : 0;
  traceEvent(TRACE_NORMAL, "\tDisable spoofing protection: %s",
             options.disableSpoofingProtection ? "yes" : "no");
  applySubnetRange(options.subnetRange);
}

Supernode::Supernode(const Napi::Object &options)
    : Supernode(SupernodeOption(options)) {}

Napi::Object Supernode::toObject(Napi::Env env) {
  auto obj = Napi::Object::New(env);
  obj.Set("port", _sn.lport);
  obj.Set("startTime", _sn.start_time);
  obj.Set("version", _sn.version);
  obj.Set("communityCount", HASH_COUNT(_sn.communities));
  obj.Set("federationName", _sn.federation->community);
  if (_sn.federation->edges) {
    obj.Set("federationParent", _sn.federation->edges->ip_addr);
  }
  obj.Set("disableSpoofingProtection", (bool)_sn.override_spoofing_protection);
  // TODO: subnetRange to string
  // obj.Set("subnetRange", _sn.min_auto_ip_net)
  return obj;
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

void Supernode::loadCommunities(const Napi::Object &communitiesObj) {
  // TODO
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

  traceEvent(TRACE_NORMAL, "Subnet Range: %s", subnetStr.c_str());

  _sn.min_auto_ip_net.net_addr = ntohl(net_min);
  _sn.min_auto_ip_net.net_bitlen = bitlen;
  _sn.max_auto_ip_net.net_addr = ntohl(net_max);
  _sn.max_auto_ip_net.net_bitlen = bitlen;
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
