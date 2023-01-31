import { Community } from '@/utils/native.util';
import { Controller, Get } from '@nestjs/common';
import { SupernodeService } from './supernode.service';

@Controller('supernodes')
export class SupernodeController {
  constructor(private supernodeService: SupernodeService) {}

  @Get()
  async list(): Promise<Community[]> {
    return await this.supernodeService.getCommunities();
  }
}
