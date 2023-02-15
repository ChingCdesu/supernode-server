import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { UserModule } from '@/modules/user/user.module';
import { JwtAuthModule } from '@/auth/jwt/jwt.module';

import { LocalAuthStrategy } from './local.strategy';
import { LocalAuthService } from './local.service';
import { LocalAuthController } from './local.controller';

@Module({
  imports: [UserModule, PassportModule, JwtAuthModule],
  providers: [LocalAuthService, LocalAuthStrategy],
  controllers: [LocalAuthController],
})
export class LocalAuthModule {}
