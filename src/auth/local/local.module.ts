import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { UserModule } from '@/modules/user/user.module';

import { LocalAuthStrategy } from './local.strategy';
import { LocalAuthService } from './local.service';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [LocalAuthService, LocalAuthStrategy],
})
export class LocalAuthModule {}
