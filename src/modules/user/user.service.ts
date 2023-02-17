import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { isNull } from 'lodash';

import {
  Pagination,
  PaginationMeta,
  PaginationOptions,
} from '@/utils/pagination.util';
import { LoggerProvider } from '@/utils/logger.util';

import { AuditService } from '@/modules/audit/audit.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User as UserModel } from './entities/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class UserService extends LoggerProvider {
  constructor(
    @Inject(REQUEST)
    private readonly _req: Request,
    @InjectModel(UserModel)
    private readonly _userModel: typeof UserModel,
    private readonly _auditService: AuditService,
  ) {
    super();
  }

  public async list(
    paginationOptions: PaginationOptions,
  ): Promise<Pagination<UserModel>> {
    const result = await this._userModel.findAndCountAll({
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

  public async get(userId: number): Promise<UserModel> {
    const user = await this._userModel.findByPk(userId);
    if (isNull(user)) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  public async create(createUserDto: CreateUserDto): Promise<UserModel> {
    const user = await this._userModel.create(Object.assign(createUserDto));
    const operator = this._req.user;
    await this._auditService.log({
      action: 'create',
      resource: 'user',
      resourceId: user.id,
      userId: operator.id,
      log: `User #${user.id} ${user.name} created`,
    });
    return user;
  }

  public async update(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<void> {
    const [affectedRows] = await this._userModel.update(updateUserDto, {
      where: {
        id: userId,
      },
      limit: 1,
    });
    if (affectedRows > 0) {
      const operator = this._req.user;
      await this._auditService.log({
        action: 'create',
        resource: 'user',
        resourceId: userId,
        userId: operator.id,
        log:
          `User #${userId} updated fields: ` +
          Object.keys(updateUserDto).join(','),
      });
    }
  }

  public async destroy(userId: number): Promise<void> {
    const affectedRows = await this._userModel.destroy({
      where: {
        id: userId,
      },
      limit: 1,
    });
    if (affectedRows > 0) {
      const operator = this._req.user;
      await this._auditService.log({
        action: 'create',
        resource: 'user',
        resourceId: userId,
        userId: operator.id,
        log: `User #${userId} deleted`,
      });
    }
  }
}
