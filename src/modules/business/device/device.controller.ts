import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { AuthenticatedGuard } from '@/common/guards/authenticated.guard';

import { BusinessCreateDeviceDto } from './dtos/create-device.dto';
import { BusinessUpdateDeviceDto } from './dtos/update-device.dto';
import { DeviceBusinessService } from './device.service';
import { DeviceDto } from './dtos/device.dto';

@ApiTags('User Device Management')
@Controller({
  path: '/devices',
  version: '1',
})
export class DeviceBusinessControllerV1 {
  constructor(private readonly _deviceBusinessService: DeviceBusinessService) {}

  @ApiOperation({ summary: '列出设备列表' })
  @UseGuards(AuthenticatedGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get()
  async list(): Promise<DeviceDto[]> {
    return await this._deviceBusinessService.list();
  }

  @ApiOperation({ summary: '获取特定id的设备' })
  @UseGuards(AuthenticatedGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get(':id')
  async get(@Param('id') deviceId: number): Promise<DeviceDto> {
    return await this._deviceBusinessService.get(deviceId);
  }

  @ApiOperation({ summary: '添加设备' })
  @UseGuards(AuthenticatedGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post()
  async create(
    @Body() createDeviceDto: BusinessCreateDeviceDto,
  ): Promise<DeviceDto> {
    return await this._deviceBusinessService.create(createDeviceDto);
  }

  @ApiOperation({ summary: '更新设备信息' })
  @UseGuards(AuthenticatedGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Put(':id')
  async update(
    @Param('id') deviceId: number,
    @Body() updateDeviceDto: BusinessUpdateDeviceDto,
  ) {
    return await this._deviceBusinessService.update(deviceId, updateDeviceDto);
  }

  @ApiOperation({ summary: '删除设备' })
  @UseGuards(AuthenticatedGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Delete(':id')
  async destroy(@Param('id') deviceId: number) {
    return await this._deviceBusinessService.destroy(deviceId);
  }
}
