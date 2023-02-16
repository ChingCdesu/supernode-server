import { UserinfoResponse } from 'openid-client';

export class OidcUserDto {
  id_token: string;
  access_token: string;
  refresh_token: string;
  userinfo: UserinfoResponse;
}
