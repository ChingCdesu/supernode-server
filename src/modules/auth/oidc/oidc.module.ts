import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { OidcStrategy, buildOpenIdClient } from './oidc.strategy';
import { SessionSerializer } from './session.serializer';

import { OidcService } from './oidc.service';
import { OidcController } from './oidc.controller';
import { useConfig } from '@/utils/config.util';

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
          PassportModule.register({ session: true, defaultStrategy: 'oidc' }),
        ],
        controllers: [OidcController],
        providers: [OidcStrategyFactory, SessionSerializer, OidcService],
      }
    : {},
)
export class OidcModule {}
