import { Module } from '@nestjs/common';
import { SupernodeModule } from '@/modules/supernode/supernode.module';
import { OidcModule } from '@/modules/auth/oidc/oidc.module';

import { DatabaseConfig } from '@/config/database.config';

@Module({
  imports: [DatabaseConfig, SupernodeModule, OidcModule],
})
export class AppModule {}
