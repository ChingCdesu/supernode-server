import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import {
  Pagination,
  PaginationMeta,
  PaginationOptions,
} from '@/utils/pagination.util';

import { AuditLog as AuditLogModel } from './entities/audit.entity';
import { CreateAuditDto } from './dto/create-audit.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLogModel)
    private readonly _auditLogModel: typeof AuditLogModel,
  ) {}

  public async log(detail: CreateAuditDto) {
    await this._auditLogModel.create(Object.assign(detail));
  }

  public async list(
    paginationOptions: PaginationOptions,
  ): Promise<Pagination<AuditLogModel>> {
    const result = await this._auditLogModel.findAndCountAll({
      order: [['createdAt', paginationOptions.order]],
      offset: paginationOptions.offset,
      limit: paginationOptions.limit,
    });

    const meta = new PaginationMeta({
      itemCount: result.count,
      paginationOptions,
    });

    return new Pagination(result.rows, meta);
  }
}
