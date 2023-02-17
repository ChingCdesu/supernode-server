import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';

import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { LoggerProvider } from '@/utils/logger.util';

import { LocalAuthService } from './local.service';

@ApiTags('Auth')
@Controller()
export class LocalAuthController extends LoggerProvider {
  constructor(private readonly _localAuthService: LocalAuthService) {
    super();
  }

  @ApiOperation({ summary: '本地登录' })
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Req() req: any) {
    return req.user;
  }

  @ApiOperation({ summary: '本地登出' })
  @Delete('auth/logout')
  async logout(@Req() req: any) {
    req.logout(this.logger.error);
    return 'ok';
  }
}
