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
import { CommunityBusinessService } from '@/modules/business/community/community.service';
import { Device } from '@/modules/supernode/entities/device.entity';
import { LoggerProvider } from '@/utils/logger.util';
import { SupernodeService } from '@/modules/supernode/supernode.service';

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

  public async list(
    paginationOptions: PaginationOptions,
  ): Promise<Pagination<DeviceDto>> {
    const data: DeviceDto[] = [];
    const operator = this._req.user;
    const nativeList = await this._supernodeService.listCommunities();

    const result = await this._deviceModel.findAndCountAll({
      where: { ownerId: operator.id },
      order: [['id', paginationOptions.order]],
      offset: paginationOptions.offset,
      limit: paginationOptions.limit,
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
          // ???????????????????????????????????????????????????
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

  public async get(deviceId: number): Promise<DeviceDto> {
    const operator = this._req.user;
    const device = await this._deviceModel.findOne({
      where: {
        id: deviceId,
        ownerId: operator.id,
      },
      limit: 1,
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
      // ???????????????????????????????????????????????????
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
    const operator = this._req.user;
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
      log: `???????????? ${result.name}`,
    });

    return this.get(result.id);
  }

  public async update(
    deviceId: number,
    updateDeviceDto: BusinessUpdateDeviceDto,
  ): Promise<void> {
    const operator = this._req.user;
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
          `???????????? #${deviceId} ?????????, ?????????: ` +
          Object.keys(updateDeviceDto).join(', '),
      });
    }
  }

  public async destroy(deviceId: number): Promise<void> {
    const operator = this._req.user;
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
        log: `???????????? #${deviceId}`,
      });
    }
  }
}
