import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { User } from '@/modules/user/entities/user.entity';
import { useConfig } from '@/utils/config.util';

@Injectable()
export class AdministrationGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    if (!request.user) {
      return false;
    }
    if (request.user instanceof User) {
      return request.user.isAdmin;
    } else if (request.user.sub) {
      const config = useConfig();
      return Array.from((request.user.groups as string[]) ?? []).includes(
        config.oidc.adminGroup,
      );
    }
    return false;
  }
}
