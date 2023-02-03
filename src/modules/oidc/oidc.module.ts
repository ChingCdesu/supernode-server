import { Module } from '@nestjs/common';
import { OidcService } from './oidc.service';
import { OidcController } from './oidc.controller';

@Module({
  controllers: [OidcController],
  providers: [OidcService],
})
export class SupernodeModule {}
