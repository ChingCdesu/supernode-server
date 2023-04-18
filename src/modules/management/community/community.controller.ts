import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Pagination, PaginationOptions } from '@/utils/pagination.util';
import { AdministrationGuard } from '@/common/guards/administration.guard';
import { AuthenticatedGuard } from '@/common/guards/authenticated.guard';

import { CommunityDto } from './dtos/community.dto';
import { CommunityManagementService } from './community.service';
import { CreateCommunityDto } from './dtos/create-community.dto';
import { TransferCommunityDto } from './dtos/transfer-community.dto';

@ApiTags('Community Management')
@Controller({
  path: 'management/communities',
  version: '1',
})
export class CommunityManagementControllerV1 {
  constructor(
    private readonly _communityManagementService: CommunityManagementService,
  ) {}

  @ApiOperation({ summary: '列出社群列表' })
  @UseGuards(AuthenticatedGuard, AdministrationGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get()
  async list(
    @Query() paginationOptions: PaginationOptions,
  ): Promise<Pagination<CommunityDto>> {
    return await this._communityManagementService.list(paginationOptions);
  }

  @ApiOperation({ summary: '获取特定id的社群' })
  @UseGuards(AuthenticatedGuard, AdministrationGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get(':id')
  async get(@Param('id') communityId: number): Promise<CommunityDto> {
    return await this._communityManagementService.get(communityId);
  }

  @ApiOperation({ summary: '添加社群' })
  @UseGuards(AuthenticatedGuard, AdministrationGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post()
  async create(@Body() body: CreateCommunityDto) {
    return await this._communityManagementService.create(body);
  }

  @ApiOperation({ summary: '删除社群' })
  @UseGuards(AuthenticatedGuard, AdministrationGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Delete(':id')
  async destroy(@Param('id') communityId: number) {
    return await this._communityManagementService.destroy(communityId);
  }

  @ApiOperation({ summary: '导出社群' })
  @UseGuards(AuthenticatedGuard, AdministrationGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get(':id/export')
  async export(@Param('id') communityId: number) {
    return await this._communityManagementService.export(communityId);
  }

  @ApiOperation({ summary: '导入社群' })
  @UseGuards(AuthenticatedGuard, AdministrationGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('import')
  async import(@Body() community: TransferCommunityDto) {
    return await this._communityManagementService.import(community);
  }
}
