import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Pagination, PaginationOptions } from '@/utils/pagination.util';
import { AdministrationGuard } from '@/common/guards/administration.guard';
import { AuthenticatedGuard } from '@/common/guards/authenticated.guard';

import { DeviceDto } from './dtos/device.dto';
import { DeviceManagementService } from './device.service';
import { ManagementCreateDeviceDto } from './dtos/create-device.dto';
import { ManagementUpdateDeviceDto } from './dtos/update-device.dto';

@ApiTags('Device Management')
@Controller({
  path: 'management/communities/:communityId/devices',
  version: '1',
})
export class DeviceManagementControllerV1 {
  constructor(
    private readonly _deviceManagementService: DeviceManagementService,
  ) {}

  @ApiOperation({ summary: '列出设备列表' })
  @UseGuards(AuthenticatedGuard, AdministrationGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get()
  async list(
    @Param('communityId') communityId: number,
    @Query() paginationOptions: PaginationOptions,
  ): Promise<Pagination<DeviceDto>> {
    return await this._deviceManagementService.list(
      communityId,
      paginationOptions,
    );
  }

  @ApiOperation({ summary: '获取特定id的设备' })
  @UseGuards(AuthenticatedGuard, AdministrationGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get(':id')
  async get(
    @Param('communityId') communityId: number,
    @Param('id') deviceId: number,
  ): Promise<DeviceDto> {
    return await this._deviceManagementService.get(communityId, deviceId);
  }

  @ApiOperation({ summary: '添加设备' })
  @UseGuards(AuthenticatedGuard, AdministrationGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post()
  async create(
    @Param('communityId') communityId: number,
    @Body() createDeviceDto: ManagementCreateDeviceDto,
  ): Promise<DeviceDto> {
    return await this._deviceManagementService.create(
      communityId,
      createDeviceDto,
    );
  }

  @ApiOperation({ summary: '更新设备信息' })
  @UseGuards(AuthenticatedGuard, AdministrationGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Put(':id')
  async update(
    @Param('communityId') communityId: number,
    @Param('id') deviceId: number,
    @Body() updateDeviceDto: ManagementUpdateDeviceDto,
  ) {
    return await this._deviceManagementService.update(
      communityId,
      deviceId,
      updateDeviceDto,
    );
  }

  @ApiOperation({ summary: '删除设备' })
  @UseGuards(AuthenticatedGuard, AdministrationGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Delete(':id')
  async destroy(
    @Param('communityId') communityId: number,
    @Param('id') deviceId: number,
  ) {
    return await this._deviceManagementService.destroy(communityId, deviceId);
  }
}
