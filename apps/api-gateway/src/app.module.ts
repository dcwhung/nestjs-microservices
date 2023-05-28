import { ConfigModule } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule, Transport } from "@nestjs/microservices";

import { SHARED_DOT_ENV } from '@app/common/constants';
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
    ClientsModule.register([
      {
        name: 'SERVICE_A',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 38881,
        },
      }, 
      {
        name: 'SERVICE_B',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 38882,
        },
      }, 
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