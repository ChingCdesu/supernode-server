import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createServer, startServer, stopServer } from '@/utils/native.util';
import { LoggerProvider } from '@/utils/logger.util';

@Injectable()
export class SupernodeService
  extends LoggerProvider
  implements OnModuleInit, OnModuleDestroy
{
  onModuleInit() {
    createServer();
    startServer().then((supernode) => {
      this.logger.log('supernode instance started');
      this.logger.log(JSON.stringify(supernode));
    });
  }

  onModuleDestroy() {
    stopServer();
    this.logger.log('supernode instance stopped');
  }
}
