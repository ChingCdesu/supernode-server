import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';

import {
  Pagination,
  PaginationMeta,
  PaginationOptions,
} from '@/utils/pagination.util';
import { Community as CommunityModal } from '@/modules/supernode/entities/community.entity';
import { LoggerProvider } from '@/utils/logger.util';
import { SupernodeService } from '@/modules/supernode/supernode.service';

import { CommunityDto } from './dtos/community.dto';
import { Device } from '@/modules/supernode/entities/device.entity';
import { User } from '@/modules/user/entities/user.entity';

@Injectable()
export class CommunityBusinessService extends LoggerProvider {
  constructor(
    @InjectModel(CommunityModal)
    private _communityModal: typeof CommunityModal,
    @InjectModel(Device)
    private _deviceModal: typeof Device,
    private _supernodeService: SupernodeService,
  ) {
    super();
  }

  public async list(
    paginationOptions: PaginationOptions,
    relations: boolean = false,
  ): Promise<Pagination<CommunityDto>> {
    const data: CommunityDto[] = [];
    const nativeList = await this._supernodeService.listCommunities();
    const result = await this._communityModal.findAndCountAll({
      order: [['id', paginationOptions.order]],
      offset: paginationOptions.offset,
      limit: paginationOptions.limit,
      include: relations ? [Device] : [],
    });

    for (let i = 0; i < result.rows.length; ++i) {
      const community = result.rows[i];
      const nativeCommunity = nativeList.find(
        (item) => item.name === community.name,
      );
      if (!nativeCommunity) continue;
      if (relations) {
        for (let j = 0; j < community.devices.length; ++j) {
          const device = await this._deviceModal.findByPk(
            community.devices[j].id,
            { include: User },
          );
          community.devices[j] = device;
        }
      }
      data.push({
        id: community.id,
        name: community.name,
        subnet: community.subnet,
        encryption: community.encryption,
        devices: community.devices,
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

  public async get(communityId: number, relations: boolean = false): Promise<CommunityDto> {
    const community = await this._communityModal.findByPk(communityId, {
      include: relations ? [Device] : [],
    });
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
    if (relations) {
      for (let j = 0; j < community.devices.length; ++j) {
        const device = await this._deviceModal.findByPk(community.devices[j].id, {
          include: User,
        });
        community.devices[j] = device;
      }
    }
    return {
      id: community.id,
      name: community.name,
      subnet: community.subnet,
      encryption: community.encryption,
      devices: community.devices,
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
      totalUserCount: nativeCommunity.devices.length,
      onlineUserCount: nativeCommunity.peers.length,
    };
  }
}
