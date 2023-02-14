import { Injectable, NotFoundException } from '@nestjs/common';

import { LoggerProvider } from '@/utils/logger.util';
import {
  Pagination,
  PaginationMeta,
  PaginationOptions,
} from '@/utils/pagination.util';
import { CreateUserDto, UpdateUserDto, User as UserModel } from './user.entity';
import { InjectModel } from '@nestjs/sequelize';
import { isNull } from 'lodash';

@Injectable()
export class UserService extends LoggerProvider {
  constructor(
    @InjectModel(UserModel)
    private _userModel: typeof UserModel,
  ) {
    super();
  }

  public async list(
    paginationOptions: PaginationOptions,
  ): Promise<Pagination<UserModel>> {
    const result = await this._userModel.findAndCountAll({
      order: ['createdAt', paginationOptions.order],
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
}
