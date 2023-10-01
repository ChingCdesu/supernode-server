import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { UserMiddleware } from '@/common/middlewares/user.middleware';

import { DatabaseConfig } from '@/config/database.config';

import { AuditModule } from '@/modules/audit/audit.module';
import { CommunityBusinessModule } from '@/modules/business/community/community.module';
import { CommunityManagementModule } from '@/modules/management/community/community.module';
import { DeviceBusinessModule } from '@/modules/business/device/device.module';
import { DeviceManagementModule } from '@/modules/management/device/device.module';
import { HealthModule } from '@/modules/health/health.module';
import { LocalAuthModule } from '@/auth/local/local.module';
import { OidcModule } from '@/auth/oidc/oidc.module';
import { SupernodeModule } from '@/modules/supernode/supernode.module';
import { UserModule } from '@/modules/user/user.module';
import { User } from '@/modules/user/entities/user.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    DatabaseConfig,
    LocalAuthModule,
    OidcModule,
    AuditModule,
    HealthModule,
    SupernodeModule,
    UserModule,
    CommunityManagementModule,
    DeviceManagementModule,
    CommunityBusinessModule,
    DeviceBusinessModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).exclude('auth/(.*)').forRoutes('*');
  }
}
