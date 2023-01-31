import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  createServer,
  loadCommunities,
  startServer,
  stopServer,
  getCommunities,
  CommunityOptions,
  Community,
  getServerInfo,
} from '@/utils/native.util';
import { LoggerProvider } from '@/utils/logger.util';

@Injectable()
export class SupernodeService
  extends LoggerProvider
  implements OnModuleInit, OnModuleDestroy
{
  onModuleInit() {
    createServer();
    startServer().then(async () => {
      this.logger.log('supernode instance started');

      const myCommunity: CommunityOptions = {
        name: 'chingc',
        users: [
          {
            name: 'chingc',
            publicKey: 'GASuB-sXgjSMv0knpoWV6QAzzGfYSPbtpnBVpQp72NC',
          },
        ],
      };
      await loadCommunities([myCommunity]);
      const serverInfo = await getServerInfo();
      this.logger.log(serverInfo);
    });
  }

  onModuleDestroy() {
    stopServer();
    this.logger.log('supernode instance stopped');
  }
  
  public listCommunities(): Promise<Community[]> {
    return getCommunities();
  }
}
