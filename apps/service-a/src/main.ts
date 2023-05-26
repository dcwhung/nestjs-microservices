import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';

import { ServiceAModule } from './service-a.module';

async function bootstrap() {
  const app = await NestFactory.create(ServiceAModule);

  const configService = app.get(ConfigService);
  const servicePort = configService.get('SERVICE_A_PORT');

  const tcpOptions = {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 38881,
    }
  }
  app.connectMicroservice(tcpOptions);

  await app.startAllMicroservices().then(() => {
    Logger.log(`👂🏼 Listening to tcp://${tcpOptions.options.host}:${tcpOptions.options.port}`);
  }).catch((err) => {
    Logger.error(`Starting Error: ${err}`);
  });

  await app.listen(servicePort).then(() => {
    Logger.log(
      `[ - Service A/bootstrap - ] 🚀 Running on: http://localhost:${servicePort}`
    );
  });
}

bootstrap();