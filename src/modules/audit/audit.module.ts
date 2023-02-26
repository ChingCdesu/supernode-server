import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuditControllerV1 } from './audit.controller';
import { AuditLog } from './entities/audit.entity';
import { AuditService } from './audit.service';

@Module({
  imports: [SequelizeModule.forFeature([AuditLog])],
  providers: [AuditService],
  controllers: [AuditControllerV1],
  exports: [AuditService],
})
export class AuditModule {}
