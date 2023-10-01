import { OidcUserDto } from '@/modules/user/dtos/oidc-user.dto';
import { User } from '@/modules/user/entities/user.entity';
import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Request, Response, NextFunction } from 'express';
import { isNull } from 'lodash';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(User)
    private readonly _userModel: typeof User,
  ) {}
  use(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
      next();
      return;
    }
    if (req.user.id) {
      req.localUser = req.user as User;
      next();
      return;
    }
    const { sub: uniqueId } = req.user as OidcUserDto;
    this._userModel
      .findOne({
        where: {
          uniqueId,
        },
      })
      .then((user) => {
        if (isNull(user)) {
          throw new ForbiddenException('Not recognized user');
        }
        req.localUser = user;
        next();
      });
  }
}
