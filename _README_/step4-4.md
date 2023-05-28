<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<p align="center">An example of building microservices with nestjs framework.</p>

[<< BACK](./step4-3.md) | [INDEX](../README.md)

# Step 4: Abstraction

## 4. - Abstraction of pingService() method in all microservices

When project scale grown up, number of microservices & routes increase, single controller & service files for API-Gateway is not enough to handling them. 

In ordering to handle the routes & services in more efficient way, we simplify the code by building 2 abstract classes for app.controller.ts & app.service.ts under /apps/api-gateway/src/.

And breakdown the routes & services based on each individual microservice.


## 4.1.1 - Create abstract.httprequest.controller.ts & abstract.httprequest.service.ts under the abstract folder

```ts
/* -- [CREATE] /libs/common/src/abstract/abstract.httprequest.controller.ts -- */


import { Logger, Controller } from '@nestjs/common';

@Controller()
export abstract class AbstractHttpRequestController {
  protected logger: Logger;

  constructor(
    controllerName: string,
    private readonly service: any,
  ) {
    this.logger = new Logger(` - API-Gateway/${controllerName} - `);
  }

  /* -- Call target microservice's pingService() method -- */
  protected ping() {
    this.logger.log(`Try to ping ${this.service.serviceName}`);
    return this.service.pingService();
  }
}

```

```ts
/* -- [CREATE] /libs/common/src/abstract/abstract.httprequest.service.ts -- */

import { map } from 'rxjs/operators';

import { Logger, Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export abstract class AbstractHttpRequestService {
  protected logger: Logger;
  protected serviceName: string;

  constructor(
    @Inject('MICROSERVICE_NAME') protected readonly microserviceName: string,
    protected readonly clientService: ClientProxy,
    providerName: string,
    ) {
    this.serviceName = microserviceName;
    this.logger = new Logger(` - API Gateway/${providerName} - `);
  }

  /* -- Call target microservice to execute TCP `ping` request -- */
  pingService() {
    this.logger.log(`Sending out TCP request to ping ${this.serviceName}`);
    
    const startTs = Date.now();
    const pattern = { cmd: 'ping' };
    const payload = {};
    
    return this.clientService
      .send<string>(pattern, payload)
      .pipe(
        map((message: string) => ({ message, duration: Date.now() - startTs })),
      );
  }
}
```


## 4.1.2 - Export new abstract component to ./libs/common/src/abstract/index.ts
```ts
export * from './abstract.httprequest.controller';
export * from './abstract.httprequest.service';
```


## 4.2 -- Create individual microservice routes handling codeset

```ts
/* -- 
  [CREATE] following folder & codeset files under /apps/api-gateway/src/ ,
  this is used for providing entry-point for Microservice A under API-Gateway routes
-- */

| service-a
| --- index.ts // -- Index to export all related variables & components -- 
| --- svc-app.controller.ts
| --- svc-app.module.ts
| --- svc-app.service.ts

/* -- [CAUTION!!] Apply the same creation for service-b -- */
```

```ts
/* -- [CREATE] /apps/api-gateway/src/service-a/svc-app.module
.ts -- */

import { Module } from '@nestjs/common';
import { SvcAppController } from './svc-app.controller';
import { SvcAppService } from './svc-app.service';

@Module({
  imports: [],
  controllers: [SvcAppController],
  providers: [SvcAppService],
})
export class SvcAppModule {}


/* -- [CAUTION!!] Standard content, no need to change in service-b -- */
```

```ts
/* -- [CREATE] /apps/api-gateway/src/service-a/svc-app.controller
.ts -- */


import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AbstractHttpRequestController } from '@app/common/abstract/';

import { SvcAppService } from './svc-app.service';

@Controller()
export class SvcAppController extends AbstractHttpRequestController {
  constructor(private readonly svcAppService: SvcAppService) {
    super(SvcAppController.name, svcAppService);
  }

  @Get('/ping-a')
  pingService() {
    return this.ping();
  }
}


/* -- [CAUTION!!] Apply the same in service-b -- */
```


```ts
/* -- [CREATE] /apps/api-gateway/src/service-a/svc-app.service
.ts -- */

import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { AbstractHttpRequestService } from '@app/common/abstract';

import { MICROSERVICE_NAME } from '.';

@Injectable()
export class SvcAppService extends AbstractHttpRequestService {
  constructor(
    @Inject(MICROSERVICE_NAME) clientService: ClientProxy,
  ) {
    super(MICROSERVICE_NAME, clientService, SvcAppService.name);
  }
}


/* -- [CAUTION!!] Standard content, no need to change in service-b -- */
```


```ts
/* -- [CREATE] /apps/api-gateway/src/service-a/index.ts -- */


export const MICROSERVICE_NAME = 'SERVICE_A';

export * from './svc-app.controller';
export * from './svc-app.module';
export * from './svc-app.service';


/* -- [CAUTION!!] Apply the same in service-b -- */
```

## 4.3 -- Update module file of API-Gateway to support individual microservice routes & services

```ts
/* -- [UPDATE] /apps/api-gateway/src/app.module.ts -- */


import { ConfigModule } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule, Transport } from "@nestjs/microservices";

import { SHARED_DOT_ENV } from '@app/common/constants';
import { LoggerMiddleware } from '@app/common/middlewares';

import { AppController } from './app.controller';

/* -- [REMOVE] AppService -- */
// import { AppService } from './app.service';

/* -- [ADD} Import microservices' app services -- */
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
  controllers: [AppController],
  providers: [AppService],
  controllers: [
    AppController, 
    /* -- [ADD] microservices' routes controllers -- */
    ServiceA.SvcAppController, 
    ServiceB.SvcAppController,
  ],
  providers: [
    /* -- [REMOVE] original api-gateway app service -- */
    // AppService,
    /* -- [ADD] microservices' app services -- */
    ServiceA.SvcAppService,
    ServiceB.SvcAppService,
  ],

})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
```

## 4.4 -- Update controller file of API-Gateway to support new individual microservice services

```ts
/* -- [UPDATE] /apps/api-gateway/src/app.controller.ts -- */


import { map, zip } from 'rxjs';

/* -- [ADD] Logger -- */
import { Controller, Get, Logger } from '@nestjs/common';

/* -- [REMOVE] AppService -- */
// import { AppService } from './app.service';

/* -- [ADD] Import microservices' app components -- */
import * as ServiceA from './service-a/';
import * as ServiceB from './service-b/';

@Controller()
export class AppController {
  /* -- [ADD] logger -- */
  protected logger: Logger;

  /* -- [REWRITE] constructor to support microservices' app services -- 
  constructor(private readonly appService: AppService) {} */
  constructor(
    private readonly serviceA: ServiceA.SvcAppService,
    private readonly serviceB: ServiceB.SvcAppService,
  ) {
    this.logger = new Logger(` - API Gateway/${AppController.name} - `);
  }


  /* -- [REMOVE] Get('ping-a') route & pingServiceA() method --
  @Get('/ping-a')
  pingServiceA() {
    return this.appService.pingServiceA();
  }
   */

  /* -- [REMOVE] Get('ping-b') route & pingServiceB() method --
  @Get('/ping-b')
  pingServiceB() {
    return this.appService.pingServiceB();
  }
  */

  @Get('/ping-all')
  /* -- [UPDATE] pingAll() method into async function -- */
  async pingAll() {
    /* -- [ADD] Output execution log -- */
    this.logger.log('/ping-all:: Try to ping all microservices.');

    return zip(
      /* -- [UPDATE] pingService() method by individual microservice's app service -- */
      // this.appService.pingServiceA(),
      // this.appService.pingServiceB()
      await this.serviceA.pingService(),
      await this.serviceB.pingService(),
    ).pipe(
      map(([
        pongServiceA, 
        pongServiceB,
      ]) => ({
        pongServiceA,
        pongServiceB,
      })),

    );
  }
}
```


## 4.5 -- Remove service file of API-Gateway under project root folder
```bash
rm ./apps/api-gateway/src/app.service.ts
```


## 4.6 - Testing the Microservices A & B with API-Gateway with browser or Postman

After starting the applications, you can access to them via the following urls and the only difference is that we have logged the HTTP requests in server-side:

## :: API-Gateway :: - http://localhost:8000/api/ping-all
## :: Microservice A :: - http://localhost:8000/api/ping-a
## :: Microservice B :: - http://localhost:8000/api/ping-b

Expected log result in `API-Gateway` terminal:
```sql
[Nest] 1621  - 05/28/2023, 2:46:23 AM     LOG [ - API Gateway/bootstrap - ] 🚀 Running on: http://localhost:8000/api
[Nest] 1621  - 05/28/2023, 2:48:24 AM     LOG [ - HTTP Request - ] GET /api/ping-all 200
[Nest] 1621  - 05/28/2023, 2:48:24 AM     LOG [ - API Gateway/AppController - ] /ping-all:: Try to ping all microservices.
[Nest] 1621  - 05/28/2023, 2:48:24 AM     LOG [ - API Gateway/SvcAppService - ] Sending out TCP request to ping SERVICE_A
[Nest] 1621  - 05/28/2023, 2:48:24 AM     LOG [ - API Gateway/SvcAppService - ] Sending out TCP request to ping SERVICE_B
[Nest] 1621  - 05/28/2023, 2:48:28 AM     LOG [ - HTTP Request - ] GET /api/ping-a 200
[Nest] 1621  - 05/28/2023, 2:48:28 AM     LOG [ - API-Gateway/SvcAppController - ] Try to ping SERVICE_A
[Nest] 1621  - 05/28/2023, 2:48:28 AM     LOG [ - API Gateway/SvcAppService - ] Sending out TCP request to ping SERVICE_A
[Nest] 1621  - 05/28/2023, 2:48:32 AM     LOG [ - HTTP Request - ] GET /api/ping-b 200
[Nest] 1621  - 05/28/2023, 2:48:32 AM     LOG [ - API-Gateway/SvcAppController - ] Try to ping SERVICE_B
[Nest] 1621  - 05/28/2023, 2:48:32 AM     LOG [ - API Gateway/SvcAppService - ] Sending out TCP request to ping SERVICE_B
```

Expected log result in `Microservice A` terminal:
```sql
[Nest] 1188  - 05/28/2023, 2:48:24 AM     LOG [ - SERVICE_A/ServiceAController - ] Someone ping me and I need to pong back~
[Nest] 1188  - 05/28/2023, 2:48:28 AM     LOG [ - SERVICE_A/ServiceAController - ] Someone ping me and I need to pong back~
```

Expected log result in `Microservice B` terminal:
```sql
[Nest] 1187  - 05/28/2023, 2:48:24 AM     LOG [ - SERVICE_B/ServiceBController - ] Someone ping me and I need to pong back~
[Nest] 1187  - 05/28/2023, 2:48:32 AM     LOG [ - SERVICE_B/ServiceBController - ] Someone ping me and I need to pong back~
```
