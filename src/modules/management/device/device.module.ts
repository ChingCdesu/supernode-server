import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuditModule } from '@/modules/audit/audit.module';
import { CommunityManagementModule } from '@/modules/management/community/community.module';
import { Device } from '@/modules/supernode/entities/device.entity';
import { SupernodeModule } from '@/modules/supernode/supernode.module';

import { DeviceManagementControllerV1 } from './device.controller';
import { DeviceManagementService } from './device.service';

@Module({
  imports: [
    AuditModule,
    SupernodeModule,
    CommunityManagementModule,
    SequelizeModule.forFeature([Device]),
  ],
  controllers: [DeviceManagementControllerV1],
  providers: [DeviceManagementService],
})
export class DeviceManagementModule {}
