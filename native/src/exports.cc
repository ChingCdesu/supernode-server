#include "supernode.h"
#include "thread.h"
#include <napi.h>

extern "C" {
#include "n2n.h"
}

#define NODE_API_EXPORT_FUNC(functionName)                                          \
  exports.Set(Napi::String::New(env, #functionName),                           \
              Napi::Function::New(env, functionName))

static Supernode *pSn = nullptr;
static ThreadCtx *worker = nullptr;

void createServer(const Napi::CallbackInfo &info) {
  if (nullptr != pSn) {
    return;
  }
  if (!info[0].IsUndefined()) {
    if (!info[0].IsObject()) {
      Napi::Error::New(info.Env(), "arguments \"options\" must be object type")
          .ThrowAsJavaScriptException();
      return;
    }
    pSn = new Supernode(info[0].As<Napi::Object>());
  } else {
    pSn = new Supernode();
  }
}

Napi::Value startServer(const Napi::CallbackInfo &info) {
  Napi::Promise::Deferred defered = Napi::Promise::Deferred::New(info.Env());
  if (nullptr == pSn) {
    defered.Reject(Napi::Error::New(info.Env(),
                                    "supernode instance not created,"
                                    " you need call \'createServer\' first")
                       .Value());
    goto end;
  }
  pSn->onCreated = [&](Supernode *sn) {
    defered.Resolve(sn->toObject(info.Env()));
  };
  pSn->start();
end:
  return defered.Promise();
}

void stopServer(const Napi::CallbackInfo &info) { pSn->stop(); }

void loadCommunities(const Napi::CallbackInfo &info) {
  if (nullptr == pSn) {
    return;
  }
  if (!info[0].IsArray()) {
    Napi::Error::New(info.Env(), "arguments \"options\" must be array type")
        .ThrowAsJavaScriptException();
    return;
  }
  pSn->loadCommunities(info[0].As<Napi::Array>());
}

Napi::Value getCommunities(const Napi::CallbackInfo &info) {
  Napi::Promise::Deferred defered = Napi::Promise::Deferred::New(info.Env());
  if (nullptr == pSn) {
    defered.Reject(Napi::Error::New(info.Env(),
                                    "supernode instance not created,"
                                    " you need call \'createServer\' first")
                       .Value());
    goto end;
  }
  defered.Resolve(pSn->getCommunities(info.Env()));
end:
  return defered.Promise();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  NODE_API_EXPORT_FUNC(createServer);
  NODE_API_EXPORT_FUNC(startServer);
  NODE_API_EXPORT_FUNC(stopServer);
  NODE_API_EXPORT_FUNC(loadCommunities);
  NODE_API_EXPORT_FUNC(getCommunities);
  return exports;
}

NODE_API_MODULE(addon, Init)
