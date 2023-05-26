import { ConfigService } from '@nestjs/config';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const gatewayPort = configService.get('API_GATEWAY_PORT');

  await app.listen(gatewayPort).then(() => {
    Logger.log(
      `[ - API Gateway/bootstrap - ] 🚀 Running on: http://localhost:${gatewayPort}/${globalPrefix}`
    );
  });
}
bootstrap();