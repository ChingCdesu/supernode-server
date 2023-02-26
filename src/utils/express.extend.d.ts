declare namespace Express {
  export interface Request {
    user:
      | import('@/modules/user/entities/user.entity').User
      | import('@/modules/user/dtos/oidc-user.dto').OidcUserDto;
  }
}
