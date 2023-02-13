import { Module } from '@nestjs/common';
import { SupernodeService } from './supernode.service';
import { SupernodeControllerV1 } from './supernode.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Community, CommunityUser } from './community.entity';

@Module({
  imports: [SequelizeModule.forFeature([Community, CommunityUser])],
  controllers: [SupernodeControllerV1],
  providers: [SupernodeService],
})
export class SupernodeModule {}
