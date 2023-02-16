import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { useConfig } from '@/utils/config.util';
import { AuditModule } from '@/modules/audit/audit.module';
import { UserModule } from '@/modules/user/user.module';
import { JwtAuthModule } from '@/auth/jwt/jwt.module';

import { OidcStrategy, buildOpenIdClient } from './oidc.strategy';
import { OidcService } from './oidc.service';
import { OidcController } from './oidc.controller';
import { SessionSerializer } from '../session/session.serializer';

const config = useConfig();

const OidcStrategyFactory = {
  provide: 'OidcStrategy',
  useFactory: async (oidcService: OidcService) => {
    const client = await buildOpenIdClient(); // secret sauce! build the dynamic client before injecting it into the strategy for use in the constructor super call.
    const strategy = new OidcStrategy(oidcService, client);
    return strategy;
  },
  inject: [OidcService],
};

@Module(
  config.oidc.enabled
    ? {
        imports: [
          PassportModule.register({ session: true }),
          AuditModule,
          UserModule,
          JwtAuthModule,
        ],
        controllers: [OidcController],
        providers: [OidcStrategyFactory, OidcService, SessionSerializer],
      }
    : {},
)
export class OidcModule {}
