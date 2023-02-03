import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '@/app.module';
import { VersioningType } from '@nestjs/common';
import { LogLevels } from '@/utils/logger.util';
import { useConfig } from '@/utils/config.util';

async function bootstrap() {
  const config = useConfig();
  const app = await NestFactory.create(AppModule, {
    logger: LogLevels.slice(0, config.app.logLevel),
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const swaggerBuilder = new DocumentBuilder()
    .setTitle('Supernode server')
    .setVersion('1.0')
    .addTag('supernodes')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerBuilder);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
