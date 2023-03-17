import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { map } from 'rxjs/operators';

import { accessLogger } from '@/utils/access-log.util';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    return next.handle().pipe(
      map((data) => {
        const accessLog =
          `Request original url: ${req.originalUrl}\n` +
          `Method: ${req.method}\n` +
          `IP: ${req.headers['X-Real-IP'] ?? req.ip}\n` +
          `User: ${JSON.stringify(req.user)}\n` +
          `Response data: ${JSON.stringify(data)}`;
        accessLogger.log(accessLog);
        return {
          data,
          code: 0,
          message: '请求成功',
        };
      }),
    );
  }
}
