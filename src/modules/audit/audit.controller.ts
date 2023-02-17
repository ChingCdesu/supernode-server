import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Pagination, PaginationOptions } from '@/utils/pagination.util';

import { AuditService } from './audit.service';
import { AuditLog as AuditLogModel } from './entities/audit.entity';

@ApiTags('Audit Log')
@Controller({
  path: 'audit',
  version: '1',
})
export class AuditController {
  constructor(private readonly _auditService: AuditService) {}

  @ApiOperation({ summary: '列出审计日志' })
  @Get()
  async list(
    @Query() paginationOptions: PaginationOptions,
  ): Promise<Pagination<AuditLogModel>> {
    return await this._auditService.list(paginationOptions);
  }
}
