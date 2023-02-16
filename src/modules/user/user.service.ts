import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { isNull } from 'lodash';

import { LoggerProvider } from '@/utils/logger.util';
import {
  Pagination,
  PaginationMeta,
  PaginationOptions,
} from '@/utils/pagination.util';
import { AuditService } from '@/modules/audit/audit.service';

import { User as UserModel } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Op } from 'sequelize';
import { OidcUserDto } from './dto/oidc-user.dto';
import { useConfig } from '@/utils/config.util';

@Injectable()
export class UserService extends LoggerProvider {
  constructor(
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
    return await this._userModel.create(Object.assign(createUserDto));
  }

  public async update(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<void> {
    await this._userModel.update(updateUserDto, {
      where: {
        id: userId,
      },
    });
  }

  public async destroy(userId: number): Promise<void> {
    await this._userModel.destroy({
      where: {
        id: userId,
      },
    });
  }

  public async validate(
    username: string,
    password: string,
  ): Promise<UserModel | null> {
    return await this._userModel.findOne({
      where: {
        [Op.and]: [
          { password },
          { [Op.or]: [{ name: username }, { email: username }] },
        ],
      },
    });
  }

  public async findOrCreate(user: OidcUserDto) {
    const config = useConfig();
    return await this._userModel.findOrCreate({
      where: {
        [Op.or]: [
          { email: user.userinfo.email },
          { uniqueId: user.userinfo.sub },
        ],
      },
      defaults: {
        name: user.userinfo.name,
        email: user.userinfo.email,
        uniqueId: user.userinfo.sub,
        issuer: 'oidc',
        isAdmin: Array.from((user.userinfo.groups as string[]) ?? []).includes(
          config.oidc.adminGroup,
        ),
      },
    });
  }
}
