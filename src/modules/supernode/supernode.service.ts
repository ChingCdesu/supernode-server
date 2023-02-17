import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  Community as NativeCommunity,
  createServer,
  getCommunities,
  loadCommunities,
  startServer,
  stopServer,
} from '@/utils/native.util';
import { LoggerProvider } from '@/utils/logger.util';
import { Community as CommunityModal } from './community.entity';
import { useConfig } from '@/utils/config.util';
@Injectable()
export class SupernodeService
  extends LoggerProvider
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @InjectModel(CommunityModal)
    private _communityModal: typeof CommunityModal,
  ) {
    super();
  }

  onModuleInit() {
    const config = useConfig();
    // 创建supernode服务器
    createServer({
      federationName: 'secret',
    });
    // 启动supernode服务器
    startServer().then(async () => {
      this.logger.log('supernode instance started');
      await this._syncCommunities();
    });
  }

  onModuleDestroy() {
    stopServer();
    this.logger.log('supernode instance stopped');
  }

  public listCommunities(): Promise<NativeCommunity[]> {
    return getCommunities();
  }

  private async _syncCommunities(): Promise<void> {
    const communities = await this._communityModal.findAll();
    await loadCommunities(communities);
    this.logger.log('communities loaded');
  }
}
