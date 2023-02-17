import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Community, CommunityUser } from './community.entity';
import { SupernodeControllerV1 } from './supernode.controller';
import { SupernodeService } from './supernode.service';

@Module({
  imports: [SequelizeModule.forFeature([Community, CommunityUser])],
  controllers: [SupernodeControllerV1],
  providers: [SupernodeService],
})
export class SupernodeModule {}
