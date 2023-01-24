import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const supernode = require('../native/build/node-supernode.node');

async function bootstrap() {
  supernode.createSn(function (sn) {
    console.log(`supernode created: ${JSON.stringify(sn)}`);
  });
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
