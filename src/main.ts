import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '@/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
