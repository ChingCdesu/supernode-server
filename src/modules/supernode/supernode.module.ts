import { Module } from '@nestjs/common';
import { SupernodeService } from './supernode.service';

@Module({
  providers: [SupernodeService],
})
export class SupernodeModule {}
