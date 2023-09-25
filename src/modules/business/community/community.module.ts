import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuditModule } from '@/modules/audit/audit.module';
import { Community } from '@/modules/supernode/entities/community.entity';
import { Device } from '@/modules/supernode/entities/device.entity';
import { SupernodeModule } from '@/modules/supernode/supernode.module';

import { CommunityBusinessControllerV1 } from './community.controller';
import { CommunityBusinessService } from './community.service';

@Module({
  imports: [
    AuditModule,
    SupernodeModule,
    SequelizeModule.forFeature([Community, Device]),
  ],
  controllers: [CommunityBusinessControllerV1],
  providers: [CommunityBusinessService],
  exports: [CommunityBusinessService],
})
export class CommunityBusinessModule {}
