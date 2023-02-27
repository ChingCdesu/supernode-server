import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';

import { User as UserModel } from '@/modules/user/entities/user.entity';

@Injectable()
export class LocalAuthService {
  constructor(
    @InjectModel(UserModel)
    private readonly _userModel: typeof UserModel,
  ) {}

  public async validateUser(
    username: string,
    password: string,
  ): Promise<UserModel | null> {
    const user = await this._userModel.findOne({
      where: {
        [Op.or]: [{ name: username }, { email: username }],
      },
    });
    if (!user) {
      return null;
    }
    const valid = await bcrypt.compare(password, user.getDataValue('password'));
    return valid ? user : null;
  }
}
