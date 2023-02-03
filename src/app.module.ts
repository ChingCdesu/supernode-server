import { Module } from '@nestjs/common';
import { SupernodeModule } from '@/modules/supernode/supernode.module';
import { DatabaseConfig } from '@/config/database.config';

@Module({
  imports: [DatabaseConfig, SupernodeModule],
})
export class AppModule {}
