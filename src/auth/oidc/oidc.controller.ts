import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { OidcGuard } from '@/common/guards/oidc.guard';
import { LoggerProvider } from '@/utils/logger.util';

import { OidcService } from './oidc.service';

@ApiTags('Auth')
@Controller()
export class OidcController extends LoggerProvider {
  constructor(private readonly _oidcService: OidcService) {
    super();
  }

  @ApiOperation({ summary: 'OAuth2登录' })
  @UseGuards(OidcGuard)
  @Get('auth/oidc')
  async login() {}

  @ApiOperation({ summary: 'OAuth2回调' })
  @UseGuards(OidcGuard)
  @Get('auth/oidc/callback')
  async callback(@Res() res: Response) {
    res.redirect('/');
  }
}
