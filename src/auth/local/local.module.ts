import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { SessionSerializer } from '@/auth/session/session.serializer';
import { UserModule } from '@/modules/user/user.module';

import { LocalAuthController } from './local.controller';
import { LocalAuthService } from './local.service';
import { LocalAuthStrategy } from './local.strategy';

@Module({
  imports: [UserModule, PassportModule.register({ session: true })],
  providers: [LocalAuthService, LocalAuthStrategy, SessionSerializer],
  controllers: [LocalAuthController],
})
export class LocalAuthModule {}
