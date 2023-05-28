import { ConfigModule } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { SHARED_DOT_ENV } from '@app/common/constants';
import { TcpModule } from '@app/common/transports';
import { LoggerMiddleware } from '@app/common/middlewares';

import { AppController } from './app.controller';

import * as ServiceA from './service-a';
import * as ServiceB from './service-b';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: SHARED_DOT_ENV,
    }),
    /** -- Registering microservices -- */
    TcpModule.register([
      { name: 'SERVICE_A' },
      { name: 'SERVICE_B' },
    ]),
  ],
  controllers: [
    AppController, 
    ServiceA.SvcAppController, 
    ServiceB.SvcAppController,
  ],
  providers: [
    ServiceA.SvcAppService,
    ServiceB.SvcAppService,
  ],

})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}