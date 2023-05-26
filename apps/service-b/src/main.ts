import { ConfigService } from '@nestjs/config';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ServiceBModule } from './service-b.module';

async function bootstrap() {
  const app = await NestFactory.create(ServiceBModule);

  const configService = app.get(ConfigService);
  const servicePort = configService.get('SERVICE_B_PORT');

  await app.listen(servicePort).then(() => {
    Logger.log(
      `[ - Service B/bootstrap - ] 🚀 Running on: http://localhost:${servicePort}`
    );
  });
}
bootstrap();