import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createSn } from './native';

async function bootstrap() {
  createSn(function (sn) {
    console.log(`supernode created: ${JSON.stringify(sn)}`);
  });
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
