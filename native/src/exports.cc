#include "supernode.h"
#include "thread.h"
#include <napi.h>

extern "C" {
#include "n2n.h"
}

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
end:
  return defered.Promise();
}

void stopServer(const Napi::CallbackInfo &info) { pSn->stop(); }

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "createServer"),
              Napi::Function::New(env, createServer));
  exports.Set(Napi::String::New(env, "startServer"),
              Napi::Function::New(env, startServer));
  exports.Set(Napi::String::New(env, "stopServer"),
              Napi::Function::New(env, stopServer));
  return exports;
}

NODE_API_MODULE(addon, Init)
