import { Module } from '@nestjs/common';

import { DatabaseConfig } from '@/config/database.config';

import { AuditModule } from '@/modules/audit/audit.module';
import { LocalAuthModule } from '@/auth/local/local.module';
import { OidcModule } from '@/auth/oidc/oidc.module';
import { SupernodeModule } from '@/modules/supernode/supernode.module';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [
    DatabaseConfig,
    LocalAuthModule,
    OidcModule,
    SupernodeModule,
    UserModule,
    AuditModule,
  ],
})
export class AppModule {}
