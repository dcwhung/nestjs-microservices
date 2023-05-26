import { ConfigService } from '@nestjs/config';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ServiceAModule } from './service-a.module';

async function bootstrap() {
  const app = await NestFactory.create(ServiceAModule);

  const configService = app.get(ConfigService);
  const servicePort = configService.get('SERVICE_A_PORT');

  await app.listen(servicePort).then(() => {
    Logger.log(
      `[ - Service A/bootstrap - ] 🚀 Running on: http://localhost:${servicePort}`
    );
  });
}
bootstrap();
