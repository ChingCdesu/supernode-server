#pragma once

#include <napi.h>
#include <thread>

struct ThreadCtx {
  ThreadCtx(Napi::Env env) {};

  std::thread nativeThread;
  Napi::ThreadSafeFunction tsfn;
};
