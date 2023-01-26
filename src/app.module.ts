import { Module } from '@nestjs/common';
import { SupernodeModule } from '@/modules/supernode/supernode.module';

@Module({
  imports: [SupernodeModule],
})
export class AppModule {}
