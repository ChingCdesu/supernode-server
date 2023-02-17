import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AdministrationGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return request.user.isAdmin;
  }
}
