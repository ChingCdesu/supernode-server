import { UserinfoResponse } from 'openid-client';

export interface OidcUserDto extends UserinfoResponse {
  token: { id_token: string; access_token: string; refresh_token: string };
}
