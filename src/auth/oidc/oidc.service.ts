import { Injectable } from '@nestjs/common';

import { OidcUserDto } from '@/modules/user/dto/oidc-user.dto';
import { UserService } from '@/modules/user/user.service';
import { AuditService } from '@/modules/audit/audit.service';
import { LoggerProvider } from '@/utils/logger.util';

@Injectable()
export class OidcService extends LoggerProvider {
  constructor(
    private readonly _userSerivce: UserService,
    private readonly _auditService: AuditService,
  ) {
    super();
  }

  async callback(user: OidcUserDto) {
    const [userInstance, created] = await this._userSerivce.findOrCreate(user);
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
