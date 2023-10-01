import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import {
  Pagination,
  PaginationMeta,
  PaginationOptions,
} from '@/utils/pagination.util';
import { AuditService } from '@/modules/audit/audit.service';
import { Community as CommunityModal } from '@/modules/supernode/entities/community.entity';
import { LoggerProvider } from '@/utils/logger.util';
import { SupernodeService } from '@/modules/supernode/supernode.service';

import { CommunityDto } from './dtos/community.dto';
import { CreateCommunityDto } from './dtos/create-community.dto';
import { TransferCommunityDto } from './dtos/transfer-community.dto';

@Injectable({ scope: Scope.REQUEST })
export class CommunityManagementService extends LoggerProvider {
  constructor(
    @Inject(REQUEST)
    private readonly _req: Request,
    @InjectModel(CommunityModal)
    private _communityModal: typeof CommunityModal,
    private _supernodeService: SupernodeService,
    private _auditService: AuditService,
  ) {
    super();
  }

  public async list(
    paginationOptions: PaginationOptions,
  ): Promise<Pagination<CommunityDto>> {
    const data: CommunityDto[] = [];
    const nativeList = await this._supernodeService.listCommunities();
    const result = await this._communityModal.findAndCountAll({
      order: [['id', paginationOptions.order]],
      offset: paginationOptions.offset,
      limit: paginationOptions.limit,
    });

    for (let i = 0; i < result.count; ++i) {
      const community = result.rows[i];
      const nativeCommunity = nativeList.find(
        (item) => item.name === community.name,
      );
      if (!nativeCommunity) continue;
      data.push({
        id: community.id,
        name: community.name,
        subnet: community.subnet,
        encryption: community.encryption,
        createdAt: community.createdAt,
        updatedAt: community.updatedAt,
        totalUserCount: nativeCommunity.devices.length,
        onlineUserCount: nativeCommunity.peers.length,
      });
    }

    const meta = new PaginationMeta({
      itemCount: result.count,
      paginationOptions,
    });

    return new Pagination(data, meta);
  }

  public async get(communityId: number): Promise<CommunityDto> {
    const community = await this._communityModal.findByPk(communityId);
    if (!community) {
      throw new Error('Community not found');
    }
    const nativeList = await this._supernodeService.listCommunities();
    const nativeCommunity = nativeList.find(
      (item) => item.name === community.name,
    );
    if (!nativeCommunity) {
      throw new Error('Community not found');
    }
    return {
      id: community.id,
      name: community.name,
      subnet: community.subnet,
      encryption: community.encryption,
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
      totalUserCount: nativeCommunity.devices.length,
      onlineUserCount: nativeCommunity.peers.length,
    };
  }

  public async create(communityDto: CreateCommunityDto): Promise<CommunityDto> {
    const community = await this._communityModal.create(
      Object.assign(communityDto),
    );
    const operator = this._req.localUser;
    await this._auditService.log({
      action: 'create',
      resource: 'community',
      resourceId: community.id,
      userId: operator.id,
      log: `Created community ${community.name}`,
    });
    await this._supernodeService.syncCommunities();
    return {
      id: community.id,
      name: community.name,
      subnet: community.subnet,
      encryption: community.encryption,
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
      totalUserCount: 0,
      onlineUserCount: 0,
    };
  }

  public async destroy(communityId: number): Promise<void> {
    const community = await this._communityModal.findByPk(communityId);
    if (!community) {
      throw new Error('Community not found');
    }
    await community.destroy();
    await this._supernodeService.syncCommunities();

    const operator = this._req.localUser;
    await this._auditService.log({
      action: 'destroy',
      resource: 'community',
      resourceId: community.id,
      userId: operator.id,
      log: `Destroyed community ${community.name}`,
    });
  }

  public async export(communityId: number): Promise<TransferCommunityDto> {
    const community = await this._communityModal.findByPk(communityId);
    if (!community) {
      throw new Error('Community not found');
    }
    const operator = this._req.localUser;
    await this._auditService.log({
      action: 'export',
      resource: 'community',
      resourceId: community.id,
      userId: operator.id,
      log: `Exported community ${community.name}`,
    });
    return {
      name: community.name,
      subnet: community.subnet,
      encryption: community.encryption,
      devices: community.devices,
    };
  }

  public async import(
    communityDto: TransferCommunityDto,
  ): Promise<CommunityDto> {
    const community = await this._communityModal.create(
      Object.assign(communityDto),
    );
    const operator = this._req.localUser;
    await this._auditService.log({
      action: 'import',
      resource: 'community',
      resourceId: community.id,
      userId: operator.id,
      log: `Imported community ${community.name}`,
    });
    await this._supernodeService.syncCommunities();
    return {
      id: community.id,
      name: community.name,
      subnet: community.subnet,
      encryption: community.encryption,
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
      totalUserCount: 0,
      onlineUserCount: 0,
    };
  }
}
