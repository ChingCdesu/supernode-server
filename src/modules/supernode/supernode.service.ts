import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  createServer,
  loadCommunities,
  startServer,
  stopServer,
  getCommunities,
} from '@/utils/native.util';
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
      loadCommunities([
        {
          name: 'chingc',
          users: [
            {
              name: 'chingc',
              publicKey: 'GASuB-sXgjSMv0knpoWV6QAzzGfYSPbtpnBVpQp72NC',
            },
          ],
        },
      ]);
    });
  }

  onModuleDestroy() {
    stopServer();
    this.logger.log('supernode instance stopped');
  }

  async getCommunities() {
    return await getCommunities();
  }
}
