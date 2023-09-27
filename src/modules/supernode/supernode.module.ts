import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Community } from './entities/community.entity';
import { Device } from './entities/device.entity';
import { SupernodeController } from './supernode.controller';
import { SupernodeService } from './supernode.service';

@Module({
  imports: [SequelizeModule.forFeature([Community, Device])],
  providers: [SupernodeService],
  exports: [SupernodeService],
  controllers: [SupernodeController],
})
export class SupernodeModule {}
