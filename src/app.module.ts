import { Module } from '@nestjs/common';

import { DatabaseConfig } from '@/config/database.config';

import { SupernodeModule } from '@/modules/supernode/supernode.module';
import { OidcModule } from '@/modules/auth/oidc/oidc.module';
import { UserModule } from '@/modules/user/user.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    DatabaseConfig,
    SupernodeModule,
    OidcModule,
    UserModule,
    AuditModule,
  ],
})
export class AppModule {}
