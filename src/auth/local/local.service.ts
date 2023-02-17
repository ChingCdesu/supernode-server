import { Injectable } from '@nestjs/common';

import { User as UserModel } from '@/modules/user/entities/user.entity';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class LocalAuthService {
  constructor(private readonly _userService: UserService) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<UserModel | null> {
    return await this._userService.validate(username, pass);
  }
}
