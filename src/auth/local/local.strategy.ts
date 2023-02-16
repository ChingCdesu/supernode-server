import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LocalAuthService } from './local.service';

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly _authService: LocalAuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this._authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('User Auth: Invalid credentials');
    }
    return user;
  }
}
