#include "supernode.h"

SupernodeOption::SupernodeOption(const Napi::Object &options) {
  if (options["port"].IsNumber()) {
    this->port = options["port"].As<Napi::Number>().Int32Value();
  }
  if (options["federationName"].IsString()) {
    this->federationName = options["federationName"].As<Napi::String>().Utf8Value();
  }
  if (options["disableSpoofingProtection"].IsBoolean()) {
    this->disableSpoofingProtection =
        options["disableSpoofingProtection"].As<Napi::Boolean>().Value();
  }
  if (options["subnetRange"].IsString()) {
    this->subnetRange = options["subnetRange"].As<Napi::String>().Utf8Value();
  }
  if (options["federationParent"].IsString()) {
    this->federationParent = options["federationParent"].As<Napi::String>().Utf8Value();
  }
}

Supernode::Supernode() : Supernode(SupernodeOption()) {}

Supernode::Supernode(const SupernodeOption &options) {}

Supernode::Supernode(const Napi::Object &options)
    : Supernode(SupernodeOption(options)) {}

Napi::Object Supernode::toObject(Napi::Env env) {
  auto obj = Napi::Object::New(env);
  obj.Set("port", _sn.lport);
  obj.Set("startTime", _sn.start_time);
  obj.Set("version", _sn.version);
  obj.Set("communityCount", HASH_COUNT(_sn.communities));
  return obj;
}

Supernode::~Supernode() {}
