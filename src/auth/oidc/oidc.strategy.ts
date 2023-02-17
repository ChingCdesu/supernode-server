import {
  Client,
  Issuer,
  Strategy,
  TokenSet,
  UserinfoResponse,
} from 'openid-client';
import { PassportStrategy } from '@nestjs/passport';
import { UnauthorizedException } from '@nestjs/common';

import { OidcUserDto } from '@/modules/user/dto/oidc-user.dto';
import { useConfig } from '@/utils/config.util';

export const buildOpenIdClient = async () => {
  const config = useConfig();
  const TrustIssuer = await Issuer.discover(config.oidc.autoDiscoverUrl);
  const client = new TrustIssuer.Client({
    client_id: config.oidc.clientId,
    client_secret: config.oidc.clientSecret,
  });
  return client;
};

export class OidcStrategy extends PassportStrategy(Strategy, 'oidc') {
  _client: Client;

  constructor(client: Client) {
    const config = useConfig();
    super({
      client: client,
      params: {
        redirect_uri: config.oidc.redirectUrl,
        scope: config.oidc.scope,
      },
      passReqToCallback: false,
      usePKCE: false,
    });

    this._client = client;
  }

  async validate(tokenset: TokenSet): Promise<OidcUserDto> {
    const userinfo: UserinfoResponse = await this._client.userinfo(tokenset);

    try {
      const id_token = tokenset.id_token;
      const access_token = tokenset.access_token;
      const refresh_token = tokenset.refresh_token;
      const user = {
        ...userinfo,
        token: {
          id_token,
          access_token,
          refresh_token,
        },
      };
      return user;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
