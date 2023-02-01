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
    // 创建supernode服务器
    createServer({
      federationName: 'secret',
    });
    // 启动supernode服务器
    startServer().then(async () => {
      this.logger.log('supernode instance started');
      // TODO: 从数据库中读取配置
      const myCommunity: CommunityOptions = {
        name: 'chingc',
        users: [
          {
            name: 'chingc',
            publicKey: 'GASuB-sXgjSMv0knpoWV6QAzzGfYSPbtpnBVpQp72NC',
          },
        ],
      };
      // 加载配置
      await loadCommunities([myCommunity]);
      // 获取服务器基本信息
      const serverInfo = await getServerInfo();
      this.logger.log(serverInfo);
      // 获取用户社区的基本信息
      const communitiesInfo = await getCommunities();
      this.logger.log(communitiesInfo);
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
