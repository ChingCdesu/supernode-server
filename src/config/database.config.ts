import { Logger, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { useConfig } from '@/utils/config.util';

const config = useConfig();
const logger = new Logger('Database');
@Module({
  imports: [
    SequelizeModule.forRoot({
      ...config.dataSource,
      autoLoadModels: true,
      synchronize: true,
      logQueryParameters: true,
      benchmark: true,
      hooks: {
        // beforeSync: (options) => {},
      },
      logging: (sql, time) => {
        logger.debug(`SQL: "${sql}" executed in ${time}ms`);
      },
      sync: {
        alter: {
          drop: false,
        },
      },
    }),
  ],
})
export class DatabaseConfig {}
