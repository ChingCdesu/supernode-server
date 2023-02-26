import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuditModule } from '@/modules/audit/audit.module';
import { Community } from '@/modules/supernode/entities/community.entity';
import { SupernodeModule } from '@/modules/supernode/supernode.module';

import { CommunityManagementController } from './community.controller';
import { CommunityManagementService } from './community.service';

@Module({
  imports: [
    AuditModule,
    SupernodeModule,
    SequelizeModule.forFeature([Community]),
  ],
  controllers: [CommunityManagementController],
  providers: [CommunityManagementService],
  exports: [CommunityManagementService],
})
export class CommunityManagementModule {}
