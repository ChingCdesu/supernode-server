#pragma once

#include <napi.h>
#include <string>

extern "C" {
#include "n2n.h"
}

#define SN_DEFAULT_PORT 7654
#define SN_DEFAULT_FEDERATION_NAME "*Federation"
#define SN_DEFAULT_FEDERATION_PARENT ""
#define SN_DEFAULT_DISABLE_SPOOFING_PROTECTION false
#define SN_DEFAULT_SUBNET_RANGE "10.128.255.0-10.255.255.0/24"

struct SupernodeOption {
  SupernodeOption() = default;
  SupernodeOption(const Napi::Object &options);
  int port = SN_DEFAULT_PORT;
  std::string federationName = SN_DEFAULT_FEDERATION_NAME;
  std::string federationParent = SN_DEFAULT_FEDERATION_PARENT;
  bool disableSpoofingProtection = SN_DEFAULT_DISABLE_SPOOFING_PROTECTION;
  std::string subnetRange = SN_DEFAULT_SUBNET_RANGE;
};

class Supernode {
public:
  Supernode();
  Supernode(const SupernodeOption &options);
  Supernode(const Napi::Object &options);
  Supernode(const Supernode &) = delete;
  Supernode(Supernode &&) = delete;
  Napi::Object toObject(Napi::Env env);
  ~Supernode();

public:
  // void stop();
  // void addCommunity();
  // void deleteCommunity();
  // void updateCommunity();
  // void listCommunities();
  // void getCommunity();
  // void getEdges();
private:
  n2n_sn_t _sn;
};