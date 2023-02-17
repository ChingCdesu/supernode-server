import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuditModule } from '@/modules/audit/audit.module';
import { SessionSerializer } from '@/auth/session/session.serializer';
import { User as UserModel } from '@/modules/user/entities/user.entity';
import { UserModule } from '@/modules/user/user.module';
import { useConfig } from '@/utils/config.util';

import { OidcStrategy, buildOpenIdClient } from './oidc.strategy';
import { OidcController } from './oidc.controller';
import { OidcService } from './oidc.service';

const config = useConfig();

const OidcStrategyFactory = {
  provide: 'OidcStrategy',
  useFactory: async () => {
    const client = await buildOpenIdClient(); // secret sauce! build the dynamic client before injecting it into the strategy for use in the constructor super call.
    const strategy = new OidcStrategy(client);
    return strategy;
  },
  inject: [OidcService],
};

@Module(
  config.oidc.enabled
    ? {
        imports: [
          PassportModule.register({ session: true, defaultStrategy: 'oidc' }),
          SequelizeModule.forFeature([UserModel]),
          AuditModule,
          UserModule,
        ],
        controllers: [OidcController],
        providers: [OidcStrategyFactory, OidcService, SessionSerializer],
      }
    : {},
)
export class OidcModule {}
