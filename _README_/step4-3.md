<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<p align="center">An example of building microservices with nestjs framework.</p>

[<<p BACK](./step4.2.md) | [INDEX](../README.md)

# Step 4: Abstraction

## 3. - Abstraction of *.module.ts under all microservices

For each microservice, they have their own controller to handle their routes individually.

To log the HTTP request activities in server-side, we need to create a logger middleware and apply to all microservices' modules. 

To avoid adding the middleware one by one, we build an abstract module class for all microservices as below.


## 3.1 - Create middlewares folder under /libs/common/src/ under project root folder
```bash
mkdir ./libs/common/src/middlewares

# -- Create index file for consolidating all middlewares -- 
touch ./libs/common/src/middlewares/index.ts
```


## 3.2.1 - Create logger.middleware.ts under the middlewares folder

```ts
/* -- [CREATE] /libs/common/src/middleware/logger.middleware.ts -- */


import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger(` - HTTP Request - `);
  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(`${req.method} ${req.baseUrl} ${res.statusCode}`);
    next();
  }
}
```


## 3.2.2 - Export new middleware to ./libs/common/src/middlewares/index.ts
```ts
export * from './logger.middleware';
```


## 3.3.1 - Create abstract.microservice.module.ts under the abstract folder, and apply the logger middleware

```ts
/* -- [CREATE] /libs/common/src/abstract/abstract.microservice.module.ts -- */

import { MiddlewareConsumer, NestModule } from '@nestjs/common';

import { LoggerMiddleware } from '@app/common/middlewares';

export abstract class AbstractMicroserviceModule implements NestModule {
  /* --
    Consume the logger middleware and apply to all routes, 
    so that we can log all HTTP request activities in server-side
  -- */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
```


## 3.3.2 - Export new abstract component to ./libs/common/src/abstract/index.ts
```ts
export * from './abstract.microservice.module';
```


## 3.4 - Update all microservices *.module.ts to extend abstract module file

```ts
/* -- [UPDATE] /apps/service-a/src/service-a.module.ts -- */

import * as path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SHARED_DOT_ENV } from '@app/common/constants';

/* -- [ADD] Import abstract microservice module -- */
import { AbstractMicroserviceModule } from '@app/common/abstract/';

import { ServiceAController } from './service-a.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        SHARED_DOT_ENV,
        /** -- Preload individual microservice .env file -- */
        path.join(__dirname.replace('dist/', ''), '.env'),
      ]
    }),
  ],
  controllers: [ServiceAController],
  providers: [],
})
/* -- [ADD] Extends abstract module class -- */
export class ServiceAModule extends AbstractMicroserviceModule {}


/* -- [CAUTION!!] Apply the same updates in /apps/service-b/src/service-b.module.ts -- */
```

## 3.5 - Apply logger middlewate to API-gateway module file

```ts
/* -- [UPDATE] /apps/api-gateway/src/app.module.ts -- */


import { ConfigModule } from '@nestjs/config';

/* -- [ADD] MiddlewareConsumer & NestModule -- */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { ClientsModule, Transport } from "@nestjs/microservices";

import { SHARED_DOT_ENV } from '@app/common/constants';

/* -- [ADD] logger middleware -- */
import { LoggerMiddleware } from '@app/common/middlewares';

import { AppController } from './app.controller';
import { AppService } from './app.service';

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
  controllers: [AppController],
  providers: [AppService],
})
/* -- 
  [UPDATE] Implements the AppModule as NestModule, 
  so as to use MiddlewareConsumer to consume logger middleware, 
  for logging all HTTP request activities under API-gateway 
-- */
// export class AppModule {}
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
```


## 3.6 - Testing the Microservices A & B with browser or Postman

After starting the applications, you can access to them via the following urls and the only difference is that we have logged the HTTP requests in server-side:

## :: API-Gateway :: - http://localhost:8000/api/ping-all
## :: Microservice A :: - http://localhost:8881/ping
## :: Microservice B :: - http://localhost:8882/ping

Expected log result in `API-Gateway` terminal:
```sql
[Nest] 98508  - 05/28/2023, 12:34:29 AM     LOG [ - API Gateway/bootstrap - ] 🚀 Running on: http://localhost:8000/api
[Nest] 98508  - 05/28/2023, 12:34:48 AM     LOG [ - HTTP Request - ] GET /api/ping-all 200
[Nest] 98508  - 05/28/2023, 12:34:48 AM     LOG Sending out TCP request to ping microservice A
[Nest] 98508  - 05/28/2023, 12:34:48 AM     LOG Sending out TCP request to ping microservice B
```

Expected log result in `Microservice A` terminal:
```sql
[Nest] 98025  - 05/28/2023, 12:14:44 AM     LOG [ - SERVICE_A/bootstrap - ] 🚀 Running on: http://localhost:8881/
[Nest] 98025  - 05/28/2023, 12:15:38 AM     LOG [ - HTTP Request - ] GET /ping 200
[Nest] 98025  - 05/28/2023, 12:15:38 AM     LOG [ - SERVICE_A/ServiceAController - ] Someone ping me and I need to pong back~
```

Expected log result in `Microservice B` terminal:
```sql
[Nest] 98048  - 05/28/2023, 12:15:01 AM     LOG [ - SERVICE_B/bootstrap - ] 🚀 Running on: http://localhost:8882/
[Nest] 98048  - 05/28/2023, 12:18:56 AM     LOG [ - HTTP Request - ] GET /ping 200
[Nest] 98048  - 05/28/2023, 12:18:56 AM     LOG [ - SERVICE_B/ServiceBController - ] Someone ping me and I need to pong back~
```
