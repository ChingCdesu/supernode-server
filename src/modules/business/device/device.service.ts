import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { AuditService } from '@/modules/audit/audit.service';
import { Community } from '@/modules/supernode/entities/community.entity';
import { CommunityBusinessService } from '@/modules/business/community/community.service';
import { Device } from '@/modules/supernode/entities/device.entity';
import { LoggerProvider } from '@/utils/logger.util';
import { SupernodeService } from '@/modules/supernode/supernode.service';
import { User } from '@/modules/user/entities/user.entity';

import { BusinessCreateDeviceDto } from './dtos/create-device.dto';
import { BusinessUpdateDeviceDto } from './dtos/update-device.dto';
import { DeviceDto } from './dtos/device.dto';

@Injectable({ scope: Scope.REQUEST })
export class DeviceBusinessService extends LoggerProvider {
  constructor(
    @Inject(REQUEST) private readonly _req: Request,
    @InjectModel(Device) private readonly _deviceModel: typeof Device,
    private readonly _auditService: AuditService,
    private readonly _communityService: CommunityBusinessService,
    private readonly _supernodeService: SupernodeService,
  ) {
    super();
  }

  public async list(): Promise<DeviceDto[]> {
    const data: DeviceDto[] = [];
    // const operator = this._req.localUser;
    const nativeList = await this._supernodeService.listCommunities();

    const result = await this._deviceModel.findAndCountAll({
      // where: { ownerId: operator.id },
      include: [Community, User],
    });

    for (let i = 0; i < result.count; ++i) {
      const device = result.rows[i];
      const nativeCommunity = nativeList.find(
        (item) => item.name === device.community.name,
      );
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
    return data;
  }

  public async get(deviceId: number): Promise<DeviceDto> {
    const operator = this._req.localUser;
    const device = await this._deviceModel.findOne({
      where: {
        id: deviceId,
        ownerId: operator.id,
      },
      limit: 1,
      include: [Community, User],
    });
    if (!device) {
      throw new NotFoundException(`Device #${deviceId} not found`);
    }
    const community = await this._communityService.get(device.community.id);
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
    createDeviceDto: BusinessCreateDeviceDto,
  ): Promise<DeviceDto> {
    const operator = this._req.localUser;
    const result = await this._deviceModel.create({
      name: createDeviceDto.name,
      publicKey: createDeviceDto.publicKey,
      ownerId: operator.id,
      communityId: createDeviceDto.communityId,
    });

    await this._supernodeService.syncCommunities();

    await this._auditService.log({
      action: 'create',
      resource: 'device',
      resourceId: result.id,
      userId: operator.id,
      log: `创建设备 ${result.name}`,
    });

    return this.get(result.id);
  }

  public async update(
    deviceId: number,
    updateDeviceDto: BusinessUpdateDeviceDto,
  ): Promise<void> {
    const operator = this._req.localUser;
    const [affectedRows] = await this._deviceModel.update(updateDeviceDto, {
      where: {
        id: deviceId,
        ownerId: operator.id,
      },
      limit: 1,
    });

    if (affectedRows > 0) {
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

  public async destroy(deviceId: number): Promise<void> {
    const operator = this._req.localUser;
    const affectedRows = await this._deviceModel.destroy({
      where: {
        id: deviceId,
        ownerId: operator.id,
      },
      limit: 1,
    });

    if (affectedRows > 0) {
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
