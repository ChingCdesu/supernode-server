import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Community } from './entities/community.entity';
import { Device } from './entities/device.entity';
import { SupernodeService } from './supernode.service';
import { SupernodeController } from './supernode.controller';

@Module({
  imports: [SequelizeModule.forFeature([Community, Device])],
  providers: [SupernodeService],
  exports: [SupernodeService],
  controllers: [SupernodeController],
})
export class SupernodeModule {}
