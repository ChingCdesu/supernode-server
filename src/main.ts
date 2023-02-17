import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';

import { LogLevels } from '@/utils/logger.util';
import { useConfig } from '@/utils/config.util';

import { AppModule } from '@/app.module';

async function bootstrap() {
  const config = useConfig();
  const app = await NestFactory.create(AppModule, {
    logger: LogLevels.slice(0, config.app.logLevel),
  });
  // Versioning API
  app.enableVersioning({
    type: VersioningType.URI,
  });
  // Swagger & OpenAPI
  const swaggerBuilder = new DocumentBuilder()
    .setTitle('Supernode server')
    .setVersion('1.0')
    .addTag('supernodes')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerBuilder);
  SwaggerModule.setup('swagger', app, document);
  // Session & Authentication
  app.use(
    session({
      secret: 'secret', // to sign session id
      resave: false, // will default to false in near future: https://github.com/expressjs/session#resave
      saveUninitialized: false, // will default to false in near future: https://github.com/expressjs/session#saveuninitialized
      rolling: true, // keep session alive
      cookie: {
        maxAge: 30 * 60 * 1000, // session expires in 1hr, refreshed by `rolling: true` option.
        httpOnly: true, // so that cookie can't be accessed via client-side script
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3000);
}
bootstrap();
