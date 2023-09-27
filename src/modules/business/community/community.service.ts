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
import { DeviceDto } from '@/modules/management/device/dtos/device.dto';
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
    relations = false,
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
      const devices: DeviceDto[] = [];
      if (relations) {
        for (let j = 0; j < community.devices.length; ++j) {
          const device = await this._deviceModal.findByPk(
            community.devices[j].id,
            { include: User },
          );
          const nativeDevice = nativeCommunity.peers.find(
            (peer) => peer.name === device.name,
          );
          devices.push(
            Object.assign(
              {
                id: device.id,
                name: device.name,
                publicKey: device.publicKey,
                community: device.community,
                owner: device.owner,
                createdAt: device.createdAt,
                updatedAt: device.updatedAt,
                isOnline: false,
              },
              // 如果设备在线，则返回设备的在线信息
              nativeDevice
                ? {
                    isOnline: true,
                    mac: nativeDevice.mac,
                    ip: nativeDevice.ip,
                    protocol: nativeDevice.protocol,
                    lastSeen: nativeDevice.lastSeen,
                  }
                : {},
            ),
          );
        }
      }
      data.push({
        id: community.id,
        name: community.name,
        subnet: community.subnet,
        encryption: community.encryption,
        devices,
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

  public async get(
    communityId: number,
    relations = false,
  ): Promise<CommunityDto> {
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
    const devices: DeviceDto[] = [];
    if (relations) {
      for (let j = 0; j < community.devices.length; ++j) {
        const device = await this._deviceModal.findByPk(
          community.devices[j].id,
          { include: User },
        );
        const nativeDevice = nativeCommunity.peers.find(
          (peer) => peer.name === device.name,
        );
        devices.push(
          Object.assign(
            {
              id: device.id,
              name: device.name,
              publicKey: device.publicKey,
              community: device.community,
              owner: device.owner,
              createdAt: device.createdAt,
              updatedAt: device.updatedAt,
              isOnline: false,
            },
            // 如果设备在线，则返回设备的在线信息
            nativeDevice
              ? {
                  isOnline: true,
                  mac: nativeDevice.mac,
                  ip: nativeDevice.ip,
                  protocol: nativeDevice.protocol,
                  lastSeen: nativeDevice.lastSeen,
                }
              : {},
          ),
        );
      }
    }
    return {
      id: community.id,
      name: community.name,
      subnet: community.subnet,
      encryption: community.encryption,
      devices,
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
      totalUserCount: nativeCommunity.devices.length,
      onlineUserCount: nativeCommunity.peers.length,
    };
  }
}
