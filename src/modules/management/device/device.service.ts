import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import {
  Pagination,
  PaginationMeta,
  PaginationOptions,
} from '@/utils/pagination.util';
import { AuditService } from '@/modules/audit/audit.service';
import { CommunityManagementService } from '@/modules/management/community/community.service';
import { Device } from '@/modules/supernode/entities/device.entity';
import { LoggerProvider } from '@/utils/logger.util';
import { SupernodeService } from '@/modules/supernode/supernode.service';

import { DeviceDto } from './dtos/device.dto';
import { ManagementCreateDeviceDto } from './dtos/create-device.dto';
import { ManagementUpdateDeviceDto } from './dtos/update-device.dto';
import { User } from '@/modules/user/entities/user.entity';
import { Community } from '@/modules/supernode/entities/community.entity';

@Injectable({ scope: Scope.REQUEST })
export class DeviceManagementService extends LoggerProvider {
  constructor(
    @Inject(REQUEST) private readonly _req: Request,
    @InjectModel(Device) private readonly _deviceModel: typeof Device,
    private readonly _auditService: AuditService,
    private readonly _communityService: CommunityManagementService,
    private readonly _supernodeService: SupernodeService,
  ) {
    super();
  }

  public async list(
    communityId: number,
    paginationOptions: PaginationOptions,
  ): Promise<Pagination<DeviceDto>> {
    const data: DeviceDto[] = [];
    const community = await this._communityService.get(communityId);
    const nativeList = await this._supernodeService.listCommunities();
    const nativeCommunity = nativeList.find(
      (item) => item.name === community.name,
    );
    const result = await this._deviceModel.findAndCountAll({
      where: { communityId },
      order: [['id', paginationOptions.order]],
      offset: paginationOptions.offset,
      limit: paginationOptions.limit,
      include: [Community, User],
    });

    for (let i = 0; i < result.count; ++i) {
      const device = result.rows[i];
      const nativeDevice = nativeCommunity.peers.find(
        (peer) => peer.name === device.name,
      );
      data.push(
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

    const meta = new PaginationMeta({
      itemCount: result.count,
      paginationOptions,
    });

    return new Pagination(data, meta);
  }

  public async get(communityId: number, deviceId: number): Promise<DeviceDto> {
    const community = await this._communityService.get(communityId);
    const device = await this._deviceModel.findOne({
      where: {
        id: deviceId,
        communityId,
      },
      limit: 1,
    });
    if (!device) {
      throw new NotFoundException(`Device #${deviceId} not found`);
    }
    const nativeList = await this._supernodeService.listCommunities();
    const nativeCommunity = nativeList.find(
      (item) => item.name === community.name,
    );
    const nativeDevice = nativeCommunity.peers.find(
      (peer) => peer.name === device.name,
    );

    return Object.assign(
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
    );
  }

  public async create(
    communityId: number,
    createDeviceDto: ManagementCreateDeviceDto,
  ): Promise<DeviceDto> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const community = await this._communityService.get(communityId); // 检查社区是否存在
    const result = await this._deviceModel.create({
      name: createDeviceDto.name,
      publicKey: createDeviceDto.publicKey,
      ownerId: createDeviceDto.ownerId,
      communityId,
    });
    const operator = this._req.localUser;

    await this._supernodeService.syncCommunities();

    await this._auditService.log({
      action: 'create',
      resource: 'device',
      resourceId: result.id,
      userId: operator.id,
      log: `创建设备 ${result.name}`,
    });

    return this.get(communityId, result.id);
  }

  public async update(
    communityId: number,
    deviceId: number,
    updateDeviceDto: ManagementUpdateDeviceDto,
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const community = await this._communityService.get(communityId); // 检查社区是否存在
    const [affectedRows] = await this._deviceModel.update(updateDeviceDto, {
      where: {
        id: deviceId,
      },
      limit: 1,
    });

    if (affectedRows > 0) {
      const operator = this._req.localUser;
      await this._supernodeService.syncCommunities();

      await this._auditService.log({
        action: 'update',
        resource: 'device',
        resourceId: deviceId,
        userId: operator.id,
        log:
          `更新设备 #${deviceId} 的信息, 更新列: ` +
          Object.keys(updateDeviceDto).join(', '),
      });
    }
  }

  public async destroy(communityId: number, deviceId: number): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const community = await this._communityService.get(communityId); // 检查社区是否存在
    const affectedRows = await this._deviceModel.destroy({
      where: {
        id: deviceId,
      },
      limit: 1,
    });

    if (affectedRows > 0) {
      const operator = this._req.localUser;
      await this._supernodeService.syncCommunities();

      await this._auditService.log({
        action: 'destroy',
        resource: 'device',
        resourceId: deviceId,
        userId: operator.id,
        log: `删除设备 #${deviceId}`,
      });
    }
  }
}
