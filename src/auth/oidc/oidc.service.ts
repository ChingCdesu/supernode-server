import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';

import { AuditService } from '@/modules/audit/audit.service';
import { LoggerProvider } from '@/utils/logger.util';
import { OidcUserDto } from '@/modules/user/dtos/oidc-user.dto';
import { User as UserModel } from '@/modules/user/entities/user.entity';
import { useConfig } from '@/utils/config.util';

@Injectable()
export class OidcService extends LoggerProvider {
  constructor(
    @InjectModel(UserModel) private readonly _userModel: typeof UserModel,
    private readonly _auditService: AuditService,
  ) {
    super();
  }

  public async callback(user: OidcUserDto) {
    const config = useConfig();
    const [userInstance, created] = await this._userModel.findOrCreate({
      where: {
        [Op.or]: [{ email: user.email }, { uniqueId: user.sub }],
      },
      defaults: {
        name: user.name,
        email: user.email,
        uniqueId: user.sub,
        issuer: 'oidc',
        isAdmin: Array.from((user.groups as string[]) ?? []).includes(
          config.oidc.adminGroup,
        ),
      },
    });

    if (created) {
      this._auditService.log({
        action: 'create',
        resource: 'user',
        resourceId: userInstance.id,
        userId: userInstance.id,
        log: `User #${userInstance.id} \`${userInstance.name}\` created via OIDC`,
      });
    }
    return userInstance;
  }
}
