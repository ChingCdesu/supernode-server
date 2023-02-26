import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuditModule } from '@/modules/audit/audit.module';
import { CommunityBusinessModule } from '@/modules/business/community/community.module';
import { Device } from '@/modules/supernode/entities/device.entity';
import { SupernodeModule } from '@/modules/supernode/supernode.module';

import { DeviceBusinessControllerV1 } from './device.controller';
import { DeviceBusinessService } from './device.service';

@Module({
  imports: [
    AuditModule,
    SupernodeModule,
    CommunityBusinessModule,
    SequelizeModule.forFeature([Device]),
  ],
  controllers: [DeviceBusinessControllerV1],
  providers: [DeviceBusinessService],
})
export class DeviceBusinessModule {}
