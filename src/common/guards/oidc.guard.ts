import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
@Injectable()
export class OidcGuard extends AuthGuard('oidc') {
  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const result = (await super.canActivate(context)) as boolean;
      await super.logIn(request);
      const response = context.switchToHttp().getResponse<Response>();
      if (result) {
        response.setHeader('X-Authenticated', 'yes');
      }
      return result;
    } catch (error) {
      // not redirect from oidc provider
      return false;
    }
  }
}
