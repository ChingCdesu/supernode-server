import { OidcUserDto } from '@/modules/user/dto/oidc-user.dto';
import { useConfig } from '@/utils/config.util';
import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  Client,
  UserinfoResponse,
  TokenSet,
  Issuer,
} from 'openid-client';
import { OidcService } from './oidc.service';

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

  constructor(private readonly _oidcService: OidcService, client: Client) {
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
        id_token,
        access_token,
        refresh_token,
        userinfo,
      };
      return user;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
