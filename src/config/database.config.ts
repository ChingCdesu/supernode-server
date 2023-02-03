import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { useConfig } from '@/utils/config.util';

const config = useConfig();
@Module({
  imports: [
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    TypeOrmModule.forRoot({
      ...config.dataSource,
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
})
export class DatabaseConfig {}
