declare namespace Express {
  export interface Request {
    user:
      | import('@/modules/user/entities/user.entity').User
      | import('@/modules/user/dto/oidc-user.dto').OidcUserDto;
  }
}
