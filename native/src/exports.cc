#include <napi.h>
#include "thread.h"
#include "supernode.h"

extern "C" {
#include "n2n.h"
}

static n2n_sn_t *pSn = nullptr;
static int keep_running;
static ThreadCtx *worker = nullptr;

Napi::Value n2nSnToObject(Napi::Env env) {
  if (!pSn) {
    return env.Null();
  }
  auto obj = Napi::Object::New(env);
  obj.Set("port", pSn->lport);
  obj.Set("startTime", pSn->start_time);
  obj.Set("version", pSn->version);
  obj.Set("communityCount", HASH_COUNT(pSn->communities));
  return obj;
}

void applyOptions(const Napi::Object &options) {}

void createSn(const Napi::CallbackInfo &args) {
  if (nullptr == pSn) {
    pSn = new n2n_sn_t();
    sn_init_defaults(pSn);
    pSn->daemon = 0;
    if (args.Length() > 0) {
      if (args[0].IsObject()) {
        applyOptions(args[0].As<Napi::Object>());
      } else {
        Napi::Error::New(args.Env(), "arguments \"option\" must be object type")
            .ThrowAsJavaScriptException();
        return;
      }
    }
    pSn->sock = open_socket(pSn->lport, INADDR_ANY, 0 /* UDP */);
    if (-1 == pSn->sock) {
      Napi::Error::New(args.Env(), "failed open UDP port")
          .ThrowAsJavaScriptException();
      return;
    }
    sn_init(pSn);
    int rc = 0;
    keep_running = 1;
    if (!worker) {
      worker = new ThreadCtx(args.Env());
      worker->tsfn = Napi::ThreadSafeFunction::New(
          args.Env(), args[0].As<Napi::Function>(), "onSupernodeCreated",
          0, 1,
          worker,
          [&](Napi::Env env, void *finalizeData, ThreadCtx *context) {
            context->nativeThread.join();
          },
          (void *)nullptr);
      worker->nativeThread = std::thread([&] {
        auto callback = [](Napi::Env env, Napi::Function jsFunction, n2n_sn_t* supernode) {
          jsFunction.Call({n2nSnToObject(env)});
        };
        worker->tsfn.BlockingCall(pSn, callback);
        pSn->keep_running = &keep_running;
        rc = run_sn_loop(pSn);
        worker->tsfn.Release();
      });
    }
  }
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "createSn"),
              Napi::Function::New(env, createSn));
  return exports;
}

NODE_API_MODULE(addon, Init)
