import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { AuthenticatedGuard } from '@/common/guards/authenticated.guard';
import { SupernodeService } from './supernode.service';

@ApiTags('Supernode')
@Controller({
  path: 'supernode',
  version: '1',
})
export class SupernodeController {
  constructor(private readonly _supernodeService: SupernodeService) {}

  @ApiOperation({ summary: '获取supernode信息' })
  @UseGuards(AuthenticatedGuard)
  @Get()
  async info() {
    return await this._supernodeService.getSupernodeInfo();
  }
}
