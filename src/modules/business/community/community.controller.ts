import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Pagination, PaginationOptions } from '@/utils/pagination.util';
import { AuthenticatedGuard } from '@/common/guards/authenticated.guard';

import { CommunityBusinessService } from './community.service';
import { CommunityDto } from './dtos/community.dto';

@ApiTags('Community')
@Controller({
  path: 'communities',
  version: '1',
})
export class CommunityBusinessControllerV1 {
  constructor(
    private readonly _communityBusinessService: CommunityBusinessService,
  ) {}

  @ApiOperation({ summary: '列出社群列表' })
  @UseGuards(AuthenticatedGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get()
  async list(
    @Query() paginationOptions: PaginationOptions,
    @Query('relations') relations: boolean = false,
  ): Promise<Pagination<CommunityDto>> {
    return await this._communityBusinessService.list(paginationOptions, relations);
  }

  @ApiOperation({ summary: '获取特定id的社群' })
  @UseGuards(AuthenticatedGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get(':id')
  async get(
    @Param('id') communityId: number,
    @Query('relations') relations: boolean = false,
  ): Promise<CommunityDto> {
    return await this._communityBusinessService.get(communityId, relations);
  }
}
