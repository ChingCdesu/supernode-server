import { Module } from '@nestjs/common';

import { DatabaseConfig } from '@/config/database.config';

import { AuditModule } from '@/modules/audit/audit.module';
import { CommunityManagementModule } from '@/modules/management/community/community.module';
import { DeviceManagementModule } from '@/modules/management/device/device.module';
import { HealthModule } from '@/modules/health/health.module';
import { LocalAuthModule } from '@/auth/local/local.module';
import { OidcModule } from '@/auth/oidc/oidc.module';
import { SupernodeModule } from '@/modules/supernode/supernode.module';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [
    DatabaseConfig,
    LocalAuthModule,
    OidcModule,
    AuditModule,
    HealthModule,
    SupernodeModule,
    UserModule,
    CommunityManagementModule,
    DeviceManagementModule,
  ],
})
export class AppModule {}
