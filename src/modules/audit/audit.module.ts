import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuditLog } from './audit.entity';
import { AuditService } from './audit.service';

@Module({
  imports: [SequelizeModule.forFeature([AuditLog])],
  providers: [AuditService],
})
export class AuditModule {}
