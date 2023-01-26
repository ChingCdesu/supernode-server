#pragma once

#include <napi.h>
#include <string>
#include <functional>
#include <thread>

extern "C" {
#include "n2n.h"
}

#define SN_DEFAULT_PORT N2N_SN_LPORT_DEFAULT
#define SN_DEFAULT_FEDERATION_NAME "Federation"
#define SN_DEFAULT_FEDERATION_PARENT ""
#define SN_DEFAULT_DISABLE_SPOOFING_PROTECTION false
#define SN_DEFAULT_SUBNET_RANGE "10.128.255.0-10.255.255.0/24"

struct SupernodeOption {
  SupernodeOption() = default;
  SupernodeOption(const Napi::Object &options);
  uint16_t port = SN_DEFAULT_PORT;
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
  void start();
  void stop();
  // void addCommunity();
  // void deleteCommunity();
  // void updateCommunity();
  // void listCommunities();
  // void getCommunity();
  // void getEdges();

public:
  std::function<void(Supernode*)> onCreated;
  std::function<void()> onReleased;
  std::function<void()> onError;
private:
  n2n_sn_t _sn;
  int _keep_running = 0;
  int _exit_code = 0;
  std::thread _worker;
};