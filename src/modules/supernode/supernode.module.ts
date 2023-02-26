import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Community } from './entities/community.entity';
import { Device } from './entities/device.entity';
import { SupernodeControllerV1 } from './supernode.controller';
import { SupernodeService } from './supernode.service';

@Module({
  imports: [SequelizeModule.forFeature([Community, Device])],
  controllers: [SupernodeControllerV1],
  providers: [SupernodeService],
  exports: [SupernodeService],
})
export class SupernodeModule {}
