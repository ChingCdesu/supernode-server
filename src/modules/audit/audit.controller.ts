import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { Pagination, PaginationOptions } from '@/utils/pagination.util';
import { AdministrationGuard } from '@/common/guards/administration.guard';
import { AuthenticatedGuard } from '@/common/guards/authenticated.guard';

import { AuditLog as AuditLogModel } from './entities/audit.entity';
import { AuditService } from './audit.service';

@ApiTags('Audit Log')
@Controller({
  path: 'audit',
  version: '1',
})
export class AuditController {
  constructor(private readonly _auditService: AuditService) {}

  @ApiOperation({ summary: '列出审计日志' })
  @UseGuards(AuthenticatedGuard, AdministrationGuard)
  @Get()
  async list(
    @Query() paginationOptions: PaginationOptions,
  ): Promise<Pagination<AuditLogModel>> {
    return await this._auditService.list(paginationOptions);
  }
}
