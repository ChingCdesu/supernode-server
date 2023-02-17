import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { AuthRequestDto } from '@/modules/user/dto/auth-request.dto';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { LoggerProvider } from '@/utils/logger.util';

import { LocalAuthService } from './local.service';
import { Request } from 'express';

@ApiTags('Auth')
@Controller()
export class LocalAuthController extends LoggerProvider {
  constructor(private readonly _localAuthService: LocalAuthService) {
    super();
  }

  @ApiOperation({ summary: '本地登录' })
  @UseGuards(LocalAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('auth/login')
  async login(@Req() req: Request, @Body() _body: AuthRequestDto) {
    return req.user;
  }

  @ApiOperation({ summary: '本地登出' })
  @Delete('auth/logout')
  async logout(@Req() req: Request) {
    req.logout(this.logger.error);
    return 'ok';
  }
}
