import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { isNull } from 'lodash';

import { LoggerProvider } from '@/utils/logger.util';
import { useConfig } from '@/utils/config.util';

import { User as UserModel } from './entities/user.entity';

@Injectable()
export class UserInitialize extends LoggerProvider implements OnModuleInit {
  constructor(
    @InjectModel(UserModel) private readonly _userModel: typeof UserModel,
  ) {
    super();
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('initializing user informations...');
    const config = useConfig();
    const user = await this._userModel.findOne({
      where: {
        id: 1,
      },
      limit: 1,
    });
    if (isNull(user)) {
      this.logger.log('admin user not found, creating...');
      await this._userModel.create({
        name: config.app.adminUsername,
        password: config.app.adminPassword,
        isAdmin: true,
      });
    } else {
      await this._userModel.update(
        {
          name: config.app.adminUsername,
          password: config.app.adminPassword,
          isAdmin: true,
        },
        {
          where: {
            id: 1,
          },
          limit: 1,
        },
      );
    }
    this.logger.log(
      'User info initialized. You can loggin with ' +
        `username: '${config.app.adminUsername}' ` +
        `and password: '${config.app.adminPassword}'.`,
    );
  }
}
