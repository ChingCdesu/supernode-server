import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuditLog as AuditLogModel } from './audit.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLogModel)
    private auditLogModel: typeof AuditLogModel,
  ) {}

  public async addAuditLog(userId: number, log: string) {
    await this.auditLogModel.create({
      userId,
      log,
    });
  }
}
