import { ConfigService } from '@nestjs/config';
import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';

import { MICROSERVICE_NAME } from '@app/common/constants';

export async function abstractMicroserviceBootstrap(moduleClass: any): Promise<INestApplication> {
  const app = await NestFactory.create(moduleClass);

  const configService = app.get(ConfigService);
  const serviceName = configService.get(MICROSERVICE_NAME);

  const logger = new Logger(` - ${serviceName}/bootstrap - `);

  const servicePort = configService.get(`${serviceName}_PORT`);
  const tcpOptions = {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 30000 + parseInt(servicePort),
    }
  };

  app.connectMicroservice(tcpOptions);

  await app.startAllMicroservices().then(() => {
    logger.log(`👂🏼 Listening to tcp://${tcpOptions.options.host}:${tcpOptions.options.port}`);
  }).catch((err) => {
    logger.error(`Starting Error: ${err}`);
  });

  await app.listen(servicePort).then(() => {
    logger.log(`🚀 Running on: http://localhost:${servicePort}/`);
  });

  return app;
}
