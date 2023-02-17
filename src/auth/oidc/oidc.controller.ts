import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Delete, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { Issuer } from 'openid-client';

import { AuthenticatedGuard } from '@/common/guards/authenticated.guard';
import { LoggerProvider } from '@/utils/logger.util';
import { OidcGuard } from '@/common/guards/oidc.guard';
import { OidcUserDto } from '@/modules/user/dto/oidc-user.dto';
import { useConfig } from '@/utils/config.util';

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
  async login() {
    // 不会执行这一句，在Guard中已经重定向了
    this.logger.debug('User is being redirected to the OIDC provider');
  }

  @ApiOperation({ summary: 'OAuth2回调' })
  @UseGuards(OidcGuard)
  @Get('auth/oidc/callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    await this._oidcService.callback(req.user as OidcUserDto);
    if (req.query['redirect']) {
      res.redirect(req.query['redirect'] as string);
    } else {
      res.redirect('/');
    }
  }

  @ApiOperation({ summary: 'OAuth2登出' })
  @UseGuards(AuthenticatedGuard)
  @Delete('auth/oidc/logout')
  async logout(@Req() req: any, @Res() res: Response) {
    const id_token = req.user ? req.user.id_token : undefined;
    req.logout();
    req.session.destroy(async () => {
      const config = useConfig();
      const TrustIssuer = await Issuer.discover(config.oidc.autoDiscoverUrl);
      const end_session_endpoint = TrustIssuer.metadata.end_session_endpoint;
      if (end_session_endpoint) {
        res.redirect(
          `${end_session_endpoint}?post_logout_redirect_uri=${config.oidc.redirectUrl}&id_token_hint=${id_token}`,
        );
      } else {
        res.redirect('/');
      }
    });
  }
}
