import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { OidcGuard } from '@/common/guards/oidc.guard';
import { LoggerProvider } from '@/utils/logger.util';

import { OidcService } from './oidc.service';
import { OidcUserDto } from '@/modules/user/dto/oidc-user.dto';

@ApiTags('Auth')
@Controller()
export class OidcController extends LoggerProvider {
  constructor(private readonly _oidcService: OidcService) {
    super();
  }

  @ApiOperation({ summary: 'OAuth2登录' })
  @UseGuards(OidcGuard)
  @Get('auth/oidc')
  async login() {
    this.logger.debug('User is being redirected to the OIDC provider');
  }

  @ApiOperation({ summary: 'OAuth2回调' })
  @UseGuards(OidcGuard)
  @Get('auth/oidc/callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    await this._oidcService.callback(req.user as OidcUserDto);
    res.redirect('/');
  }
}
