import { ConfigService } from '@nestjs/config';
import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { TcpService } from '@app/common/transports';

import { MICROSERVICE_NAME } from '@app/common/constants';

export async function abstractMicroserviceBootstrap(moduleClass: any): Promise<INestApplication> {
  const app = await NestFactory.create(moduleClass);

  const configService = app.get(ConfigService);
  const serviceName = configService.get(MICROSERVICE_NAME);

  const logger = new Logger(` - ${serviceName}/bootstrap - `);

  const servicePort = configService.get(`${serviceName}_PORT`);
  const tcpOptions = new TcpService(configService).getOptions(serviceName);

  /** -- Connect & start microservice with TCP -- */
  app.connectMicroservice(tcpOptions);

  await app.startAllMicroservices().then(() => {
    logger.log(`👂🏼 Listening to tcp://${tcpOptions.options.host}:${tcpOptions.options.port}`);
  }).catch((err) => {
    logger.error(`Starting Error: ${err}`);
  });

  /** -- Start HTTP for microservice for standalone debug purpose only -- */
  await app.listen(servicePort).then(() => {
    logger.log(`🚀 Running on: http://localhost:${servicePort}/`);
  });

  return app;
}