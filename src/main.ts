import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { MongooseExceptionFilter } from '@dev-force/nestjs-data-generic';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const env = config.get('app.env');

  if (env === 'local' || env === 'dev' || env === 'uat') {
    const swagger = new DocumentBuilder()
      .setTitle('Dev Force Nestjs Data Generic Sample Service')
      .setVersion('0.0.1')
      .setDescription('Nestjs Data Generic Sample Service')
      .build();

    const docs = SwaggerModule.createDocument(app, swagger);

    SwaggerModule.setup(config.getOrThrow('app.swagger.path'), app, docs);
  }

  // enforcing CORS
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      skipMissingProperties: true,
      forbidUnknownValues: true,
    }),
  );

  app.useGlobalFilters(new MongooseExceptionFilter());

  await app.listen(config.getOrThrow('app.port'));
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
