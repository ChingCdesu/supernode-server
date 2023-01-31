import { Module } from '@nestjs/common';
import { SupernodeService } from './supernode.service';
import { SupernodeController } from './supernode.controller';

@Module({
  controllers: [SupernodeController],
  providers: [SupernodeService],
})
export class SupernodeModule {}
