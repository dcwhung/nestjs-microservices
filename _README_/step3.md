<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<p align="center">An example of building microservices with nestjs framework.</p>

[<< BACK](./step2.md) | [INDEX](../README.md) | [NEXT >>](./step4-1.md)

# Step 3: Transform Services A & B as nestjs microservices

## 0. - Install necessary dependencies & remove useless files
```bash
npm i rxjs

# -- [REMOVE] all *.spec.ts files (remove under project root folder) -- 
find ./apps -type f -name "*.spec.ts" -delete
```

## 1. - Update transport layer from HTTP to TCP with service configuration

```ts
/* -- [UPDATE] /apps/service-a/src/main.ts -- */


import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

/* -- [ADD] Transport -- */
import { Transport } from '@nestjs/microservices';

import { ServiceAModule } from './service-a.module';

async function bootstrap() {
  const app = await NestFactory.create(ServiceAModule);

  const configService = app.get(ConfigService);
  const servicePort = configService.get('SERVICE_A_PORT');

  /* -- [ADD] Connect microservice with TCP -- */
  const tcpOptions = {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 38881,
    }
  }
  app.connectMicroservice(tcpOptions);

  /* -- [ADD] Start microservice with TCP -- */
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


/* -- [CAUTION!!] Apply the same updates in /apps/service-b/src/main.ts and update Service B TCP port as 38882 -- */
```

## 2. - Remove original AppService usages from the AppModule & AppController file in each service folder

* AppService, AppModule, AppController in `/apps/service-a/src` are equivalent to ServiceAService, ServiceAModule, ServiceAController, similar in `/app/service-b/src`

### 2.1 Remove AppService files (i.e. service-a/b.service.ts) 
```bash
rm ./apps/service-a/src/service-a.service.ts 
rm ./apps/service-b/src/service-b.service.ts 
```

### 2.2 Update AppModule file (i.e. service-a/b.module.ts) 
```ts
/* -- [UPDATE] /apps/service-a/src/service-a.module.ts -- */


import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { SHARED_DOT_ENV } from '@app/common/constants';

import { ServiceAController } from './service-a.controller';

/* -- [REMOVE] ServiceAService -- */
// import { ServiceAService } from './service-a.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: SHARED_DOT_ENV,
    }),
  ],
  controllers: [ServiceAController],
  /* -- [REMOVE] ServiceAService -- */
  // providers: [ServiceAService],
  providers: [],
})
export class ServiceAModule {}

/* -- [CAUTION!!] Apply the same updates in /apps/service-b/src/service-b.module.ts -- */
```

### 2.3 Update AppController file (i.e. service-a/b.controller.ts) 

```ts
/* -- [UPDATE] /apps/service-a/src/service-a.controller.ts -- */


import { Controller, Get } from '@nestjs/common';

/* -- [REMOVE] ServiceAService -- */
// import { ServiceAService } from './service-a.service';

@Controller()
export class ServiceAController {
  /* -- [REMOVE] ServiceAService -- */
  // constructor(private readonly serviceAService: ServiceAService) {}
  constructor() {}

  /* -- Remove Get() route & getHello() method -- 
  @Get()
  getHello(): string {
    return this.serviceAService.getHello();
  }
  */
}

/* -- [CAUTION!!] Apply the same updates in /apps/service-b/src/service-b.controller.ts -- */
```


## 3. - Update AppController to use the Microservice Message pattern to serve clients

```ts
/* -- [UPDATE] /apps/service-a/src/service-a.controller.ts -- */

/* -- [ADD] delay, of -- */
import { delay, of } from 'rxjs';

/* -- [ADD] MessagePattern -- */
import { MessagePattern } from '@nestjs/microservices';

/* -- [ADD] Logger -- */
import { Controller, Get, Logger } from '@nestjs/common';

@Controller()
export class ServiceAController {
  constructor() {}

  /* -- [CREATE] Get('ping') route, MessagePattern for command `ping` & ping() method -- */
  @Get('ping')
  @MessagePattern({ cmd: 'ping' })
  ping(_: any) {
    Logger.log(`Service A :: Someone ping me and I need to pong back~`);
    return of('pong-a').pipe(delay(1000));
  }
}

/* -- [CAUTION!!] Apply the same updates in /apps/service-b/src/service-b.controller.ts -- */
```

## 4. - Register the Services A & B in API-Gateway

```ts
/* -- [UPDATE] /apps/api-gateway/src/app.module.ts -- */


import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

/* -- [ADD] ClientsModule, Transport -- */
import { ClientsModule, Transport } from "@nestjs/microservices";

import { SHARED_DOT_ENV } from '@app/common/constants';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: SHARED_DOT_ENV,
    }),
    /* -- [ADD] Register Services A & B -- */
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
export class AppModule {}
```

## 5. - Inject new services into API-Gateway AppService and create a method to query the Services A & B

```ts
/* -- [UPDATE] /apps/api-gateway/src/app.service.ts -- */


/* -- [ADD] map -- */
import { map } from 'rxjs/operators';

/* -- [ADD] Inject, Logger -- */
import { Injectable, Inject, Logger } from '@nestjs/common';

/* -- [ADD] ClientProxy -- */
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  /* -- [REMOVE] getHello() method -- 
  getHello(): string {
    return 'Hello World!';
  }
  */

  /* -- [ADD] constructor & inject services A & B into AppService -- */
  constructor(
    @Inject('SERVICE_A') private readonly clientServiceA: ClientProxy,
    @Inject('SERVICE_B') private readonly clientServiceB: ClientProxy,
  ) {}

  /* -- [ADD] pingServiceA method to query Service A -- */
  pingServiceA() {
    Logger.log(`Sending out TCP request to ping microservice A`);

    const startTs = Date.now();
    const pattern = { cmd: 'ping' };
    const payload = {};

    return this.clientServiceA
      .send<string>(pattern, payload)
      .pipe(
        map((message: string) => ({ message, duration: Date.now() - startTs }))
      );
  }

  /* -- [ADD] pingServiceB method to query Service B -- */
  pingServiceB() {
    Logger.log(`Sending out TCP request to ping microservice B`);

    const startTs = Date.now();
    const pattern = { cmd: 'ping' };
    const payload = {};

    return this.clientServiceB
      .send<string>(pattern, payload)
      .pipe(
        map((message: string) => ({ message, duration: Date.now() - startTs }))
      );
  }
}
```

## 6. - Use the new method from the AppService in the AppController.

```ts
/* -- [UPDATE] /apps/api-gateway/src/app.controller.ts -- */


/* -- [ADD] map, zip -- */
import { map, zip } from 'rxjs';

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /* -- [REMOVE] Get() route & getHello() method -- 
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  */

  /* -- [ADD] Get('/ping-a') route & pingServiceA() method -- */
  @Get('/ping-a')
  pingServiceA() {
    return this.appService.pingServiceA();
  }

  /* -- [ADD] Get('/ping-b') route & pingServiceB() method -- */
  @Get('/ping-b')
  pingServiceB() {
    return this.appService.pingServiceB();
  }

  /* -- [ADD] Get('/ping-all') route & pingAll() method -- */
  @Get('/ping-all')
  pingAll() {
    return zip(
      this.appService.pingServiceA(),
      this.appService.pingServiceB()
    ).pipe(
      map(([pongServiceA, pongServiceB]) => ({
        pongServiceA,
        pongServiceB
      }))
    );
  }

}
```

## 7. - Running the apps in 3 different terminals
```bash
# -- Running api-gateway -- 
npm run start:dev api-gateway

# -- Running Service A -- 
npm run start:dev service-a

# -- Running Service B -- 
npm run start:dev service-b
```

## :: API-Gateway :: Expected Command Result:
```sql
> nestjs-microservices@0.0.1 start:dev
> nest start --watch api-gateway


 Info  Webpack is building your sources...

webpack 5.82.1 compiled successfully in 740 ms
Type-checking in progress...
[Nest] 91351  - 05/26/2023, 11:44:51 PM     LOG [NestFactory] Starting Nest application...
[Nest] 91351  - 05/26/2023, 11:44:51 PM     LOG [InstanceLoader] ClientsModule dependencies initialized +21ms
[Nest] 91351  - 05/26/2023, 11:44:51 PM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +1ms
[Nest] 91351  - 05/26/2023, 11:44:51 PM     LOG [InstanceLoader] AppModule dependencies initialized +0ms
[Nest] 91351  - 05/26/2023, 11:44:51 PM     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 91351  - 05/26/2023, 11:44:52 PM     LOG [RoutesResolver] AppController {/api}: +943ms
[Nest] 91351  - 05/26/2023, 11:44:52 PM     LOG [RouterExplorer] Mapped {/api/ping-a, GET} route +3ms
[Nest] 91351  - 05/26/2023, 11:44:52 PM     LOG [RouterExplorer] Mapped {/api/ping-b, GET} route +0ms
[Nest] 91351  - 05/26/2023, 11:44:52 PM     LOG [RouterExplorer] Mapped {/api/ping-all, GET} route +0ms
[Nest] 91351  - 05/26/2023, 11:44:52 PM     LOG [NestApplication] Nest application successfully started +2ms
[Nest] 91351  - 05/26/2023, 11:44:52 PM     LOG [ - API Gateway/bootstrap - ] 🚀 Running on: http://localhost:8000/api
No errors found.
```

## :: Microservice A :: Expected Command Result:
```sql
> nestjs-microservices@0.0.1 start:dev
> nest start --watch service-a


 Info  Webpack is building your sources...

webpack 5.82.1 compiled successfully in 984 ms
Type-checking in progress...
[Nest] 91369  - 05/26/2023, 11:45:00 PM     LOG [NestFactory] Starting Nest application...
[Nest] 91369  - 05/26/2023, 11:45:00 PM     LOG [InstanceLoader] ServiceAModule dependencies initialized +26ms
[Nest] 91369  - 05/26/2023, 11:45:00 PM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +0ms
[Nest] 91369  - 05/26/2023, 11:45:00 PM     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 91369  - 05/26/2023, 11:45:00 PM     LOG [NestMicroservice] Nest microservice successfully started +38ms
[Nest] 91369  - 05/26/2023, 11:45:00 PM     LOG 👂🏼 Listening to tcp://localhost:38881
[Nest] 91369  - 05/26/2023, 11:45:00 PM     LOG [RoutesResolver] ServiceAController {/}: +46ms
[Nest] 91369  - 05/26/2023, 11:45:00 PM     LOG [RouterExplorer] Mapped {/ping, GET} route +1ms
[Nest] 91369  - 05/26/2023, 11:45:00 PM     LOG [NestApplication] Nest application successfully started +2ms
[Nest] 91369  - 05/26/2023, 11:45:00 PM     LOG [ - Service A/bootstrap - ] 🚀 Running on: http://localhost:8881
No errors found.
```

## :: Microservice B :: Expected Command Result:
```sql
> nestjs-microservices@0.0.1 start:dev
> nest start --watch service-b


 Info  Webpack is building your sources...

webpack 5.82.1 compiled successfully in 922 ms
Type-checking in progress...
[Nest] 91386  - 05/26/2023, 11:45:08 PM     LOG [NestFactory] Starting Nest application...
[Nest] 91386  - 05/26/2023, 11:45:08 PM     LOG [InstanceLoader] ServiceBModule dependencies initialized +35ms
[Nest] 91386  - 05/26/2023, 11:45:08 PM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +11ms
[Nest] 91386  - 05/26/2023, 11:45:08 PM     LOG [InstanceLoader] ConfigModule dependencies initialized +10ms
[Nest] 91386  - 05/26/2023, 11:45:08 PM     LOG [NestMicroservice] Nest microservice successfully started +31ms
[Nest] 91386  - 05/26/2023, 11:45:08 PM     LOG 👂🏼 Listening to tcp://localhost:38882
[Nest] 91386  - 05/26/2023, 11:45:08 PM     LOG [RoutesResolver] ServiceBController {/}: +43ms
[Nest] 91386  - 05/26/2023, 11:45:08 PM     LOG [RouterExplorer] Mapped {/ping, GET} route +9ms
[Nest] 91386  - 05/26/2023, 11:45:08 PM     LOG [NestApplication] Nest application successfully started +3ms
[Nest] 91386  - 05/26/2023, 11:45:08 PM     LOG [ - Service B/bootstrap - ] 🚀 Running on: http://localhost:8882
No errors found.
```

## 8. - Testing the API-Gateway & Microservices A & B with browser or Postman

After starting the applications, you can access to them via the following urls:

## :: Microservice A :: - http://localhost:8881/ping

Expected result in browser:
```ts
pong-a
```

Expected log result in terminal:
```sql
[Nest] 91369  - 05/26/2023, 11:45:00 PM     LOG [ - Service A/bootstrap - ] 🚀 Running on: http://localhost:8881
No errors found.
[Nest] 91369  - 05/26/2023, 11:51:11 PM     LOG Service A :: Someone ping me and I need to pong back~
```

## :: Microservice B :: - http://localhost:8882/ping

Expected result in browser:
```ts
pong-b
```

Expected log result in terminal:
```sql
[Nest] 91386  - 05/26/2023, 11:45:08 PM     LOG [ - Service B/bootstrap - ] 🚀 Running on: http://localhost:8882
No errors found.
[Nest] 91386  - 05/26/2023, 11:51:11 PM     LOG Service B :: Someone ping me and I need to pong back~
```

## :: API-Gateway :: - http://localhost:8000/api/ping-all

If you can receive the pong messages from Microservices A & B, which meant the TCP communication between API-Gateway and the microservices is built and run successfully.

Expected result in browser:
```json
{
    "pongServiceA": {
        "message": "pong-a",
        "duration": 1190
    },
    "pongServiceB": {
        "message": "pong-b",
        "duration": 1179
    }
}
```

Expected log result in terminals:
```sql
# -- API Gateway Terminal -- 
[Nest] 91351  - 05/26/2023, 11:44:52 PM     LOG [ - API Gateway/bootstrap - ] 🚀 Running on: http://localhost:8000/api
No errors found.
[Nest] 91351  - 05/26/2023, 11:51:11 PM     LOG Sending out TCP request to ping microservice A
[Nest] 91351  - 05/26/2023, 11:51:11 PM     LOG Sending out TCP request to ping microservice B


# -- Microservice A Terminal -- 
[Nest] 91369  - 05/26/2023, 11:45:00 PM     LOG [ - Service A/bootstrap - ] 🚀 Running on: http://localhost:8881
No errors found.
[Nest] 91369  - 05/26/2023, 11:51:11 PM     LOG Service A :: Someone ping me and I need to pong back~


# -- Microservice B Terminal -- 
[Nest] 91386  - 05/26/2023, 11:45:08 PM     LOG [ - Service B/bootstrap - ] 🚀 Running on: http://localhost:8882
No errors found.
[Nest] 91386  - 05/26/2023, 11:51:11 PM     LOG Service B :: Someone ping me and I need to pong back~
```

If either one microservice is down, then the result in browser will be:
```json
{
    "statusCode": 500,
    "message": "Internal server error"
}
```

Expected log result in `api-gateway` terminal:
```sql
[Nest] 91351  - 05/27/2023, 12:21:15 AM     LOG Sending out TCP request to ping microservice A
[Nest] 91351  - 05/27/2023, 12:21:15 AM     LOG Sending out TCP request to ping microservice B
[Nest] 91351  - 05/27/2023, 12:21:16 AM   ERROR [ExceptionsHandler] AggregateError
```
