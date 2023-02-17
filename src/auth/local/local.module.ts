import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';

import { SessionSerializer } from '@/auth/session/session.serializer';
import { User as UserModel } from '@/modules/user/entities/user.entity';
import { UserModule } from '@/modules/user/user.module';

import { LocalAuthController } from './local.controller';
import { LocalAuthService } from './local.service';
import { LocalAuthStrategy } from './local.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule.register({ session: true }),
    SequelizeModule.forFeature([UserModel]),
  ],
  providers: [LocalAuthService, LocalAuthStrategy, SessionSerializer],
  controllers: [LocalAuthController],
})
export class LocalAuthModule {}
