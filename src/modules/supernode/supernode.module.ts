import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Community } from './entities/community.entity';
import { Device } from './entities/device.entity';
import { SupernodeService } from './supernode.service';

@Module({
  imports: [SequelizeModule.forFeature([Community, Device])],
  providers: [SupernodeService],
  exports: [SupernodeService],
})
export class SupernodeModule {}
