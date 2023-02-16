import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { UserModule } from '@/modules/user/user.module';
import { SessionSerializer } from '@/auth/session/session.serializer';

import { LocalAuthStrategy } from './local.strategy';
import { LocalAuthService } from './local.service';
import { LocalAuthController } from './local.controller';

@Module({
  imports: [UserModule, PassportModule.register({ session: true })],
  providers: [LocalAuthService, LocalAuthStrategy, SessionSerializer],
  controllers: [LocalAuthController],
})
export class LocalAuthModule {}
