import { Module } from '@nestjs/common';
import { SupernodeService } from './supernode.service';
import { SupernodeControllerV1 } from './supernode.controller';

@Module({
  controllers: [SupernodeControllerV1],
  providers: [SupernodeService],
})
export class SupernodeModule {}
