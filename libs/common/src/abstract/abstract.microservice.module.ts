import { MiddlewareConsumer, NestModule } from '@nestjs/common';

import { LoggerMiddleware } from '@app/common/middlewares';

export abstract class AbstractMicroserviceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}