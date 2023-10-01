import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { User } from '@/modules/user/entities/user.entity';
import { useConfig } from '@/utils/config.util';

@Injectable()
export class AdministrationGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    return !!request.localUser?.isAdmin;
  }
}
