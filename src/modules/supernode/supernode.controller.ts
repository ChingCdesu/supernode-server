import { Community as NativeCommunity } from '@/utils/native.util';
import { Controller, Get } from '@nestjs/common';
import { SupernodeService } from './supernode.service';

@Controller({
  path: 'supernodes',
  version: '1',
})
export class SupernodeControllerV1 {
  constructor(private supernodeService: SupernodeService) {}

  @Get()
  async list(): Promise<NativeCommunity[]> {
    return await this.supernodeService.listCommunities();
  }
}
