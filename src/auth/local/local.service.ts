import { Injectable } from '@nestjs/common';

import { UserService } from '@/modules/user/user.service';
import { User as UserModel } from '@/modules/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDto } from '@/modules/user/dto/auth-response.dto';

@Injectable()
export class LocalAuthService {
  constructor(
    private readonly _userService: UserService,
    private readonly _jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<UserModel | null> {
    return await this._userService.validate(username, pass);
  }

  async login(user: UserModel): Promise<AuthResponseDto> {
    const payload = { sub: user.id };
    return Object.assign(user, {
      access_token: this._jwtService.sign(payload, { secret: 'secret' }),
    });
  }
}
