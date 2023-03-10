import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuditModule } from '@/modules/audit/audit.module';

import { User } from './entities/user.entity';
import { UserControllerV1 } from './user.controller';
import { UserInitialize } from './user.initialize';
import { UserService } from './user.service';

@Module({
  imports: [AuditModule, SequelizeModule.forFeature([User])],
  providers: [UserService, UserInitialize],
  controllers: [UserControllerV1],
  exports: [UserService],
})
export class UserModule {}
