<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<p align="center">An example of building microservices with nestjs framework.</p>

[<< BACK](./step3.md) | [INDEX](../README.md) | [NEXT >>](./step4-2.md)

# Step 4: Abstraction

## 1. - Abstraction of bootstrap() method in main.ts under all microservices

As the main.ts under all microservices look very similar, the only difference is calling different service name component, so we can convert it into a abstract version

## 1.1 - Create abstact folder under /libs/common/src/ under project root folder
```bash
mkdir ./libs/common/src/abstract

# -- Create index file for consolidating all abstract components -- 
touch ./libs/common/src/abstract/index.ts
```

## 1.2.1 - Create abstract.microservice.bootstrap.ts under the abstract folder

```ts
/* -- [CREATE] /libs/common/src/abstract/abstract.microservice.bootstrap.ts -- */
/* -- Content based on previous /app/service-a/src/main.ts to do the amendment -- */

import { ConfigService } from '@nestjs/config';

/* -- [ADD] INestApplication -- */
import { INestApplication, Logger } from '@nestjs/common';

import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';

/* -- [ADD] MICROSERVICE_NAME -- */
import { MICROSERVICE_NAME } from '@app/common/constants';

/* -- [REWRITE] bootstrap() method to abstractMicroserviceBootstrap() method -- */
// async function bootstrap() {
export async function abstractMicroserviceBootstrap(moduleClass: any): Promise<INestApplication> {
  /* -- [REWRITE] module class base on input property -- */
  // const app = await NestFactory.create(ServiceAModule);
  const app = await NestFactory.create(moduleClass);

  const configService = app.get(ConfigService);
  
  /* -- [ADD] Get microservice name based on .env in each microservice folder -- */
  const serviceName = configService.get(MICROSERVICE_NAME);

  /* -- [ADD] Create a logger with dynamic name according to input service name -- */
  const logger = new Logger(` - ${serviceName}/bootstrap - `);

  /* -- [UPDATE] Get microservice HTTP port based according to input service name -- */
  const servicePort = configService.get(`${serviceName}_PORT`);
  const tcpOptions = {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      /* -- [UPDATE] TCP port with a offset number and based on microservice HTTP port -- */
      // port: 38881,
      port: parseInt(30000 + servicePort),
    }
  };

  app.connectMicroservice(tcpOptions);

  await app.startAllMicroservices().then(() => {
    logger.log(`👂🏼 Listening to tcp://${tcpOptions.options.host}:${tcpOptions.options.port}`);
  }).catch((err) => {
    logger.error(`Starting Error: ${err}`);
  });

  await app.listen(servicePort).then(() => {
    /* -- [UPDATE] the log message and simplify it -- 
    Logger.log(
      `[ - Service A/bootstrap - ] 🚀 Running on: http://localhost:${servicePort}`
    );
    */
    logger.log(`🚀 Running on: http://localhost:${servicePort}/`);
  });

  /* -- [ADD] Return the application -- */
  return app;
}

/* -- [REMOVE] bootstrap() function call --
bootstrap();
*/
```

## 1.2.2 - Export new abstract component to ./libs/common/src/abstract/index.ts
```ts
export * from './abstract.microservice.bootstrap';
```

## 1.3 - Add back MICROSERVICE_NAME to /libs/common/src/constants.ts
```ts
export const MICROSERVICE_NAME = 'MICROSERVICE_NAME';
```

## 1.4 - Create .env file in each microservices folder to set the microservice name
```ts
/* -- [CREATE] /apps/service-a/.env -- */
MICROSERVICE_NAME = 'SERVICE_A'

/* -- [CREATE] /apps/service-b/.env -- */
MICROSERVICE_NAME = 'SERVICE_B'
```

## 1.5 - Set module file in each microservice read the new .env file
```ts
/* -- [UPDATE] /apps/service-a/src/service-a.module.ts -- */


/* -- [ADD] path -- */
import * as path from 'path';

ConfigModule.forRoot({
  isGlobal: true,
    envFilePath: [
      SHARED_DOT_ENV,
      /* -- [ADD] Preload individual microservice .env file -- */
      path.join(__dirname.replace('dist/', ''), '.env'),
    ]
}),


/* -- [CAUTION!!] Apply the same updates in /apps/service-b/src/service-b.module.ts -- */
```

## 1.6 - Update bootstrap() method in main.ts under all microservices
```ts
/* -- [REWRITE] /apps/service-a/src/main.ts -- */

import { abstractMicroserviceBootstrap } from '@app/common/abstract';

import { ServiceAModule } from './service-a.module';

async function bootstrap() {
  const app = await abstractMicroserviceBootstrap(ServiceAModule);
}
bootstrap();


/* -- [CAUTION!!] Apply the same updates in /apps/service-b/src/main.ts -- */
```

## 1.7 - Running & test the microservices in 2 different terminals
```bash
# -- Running Service A -- 
npm run start:dev service-a

# -- Running Service B -- 
npm run start:dev service-b
```

## :: Microservice A :: Expected Command Result:
```sql
 Info  Webpack is building your sources...

webpack 5.82.1 compiled successfully in 1223 ms
Type-checking in progress...
No errors found.
[Nest] 93549  - 05/27/2023, 1:48:41 AM     LOG [NestFactory] Starting Nest application...
[Nest] 93549  - 05/27/2023, 1:48:41 AM     LOG [InstanceLoader] ServiceAModule dependencies initialized +14ms
[Nest] 93549  - 05/27/2023, 1:48:41 AM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +0ms
[Nest] 93549  - 05/27/2023, 1:48:41 AM     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 93549  - 05/27/2023, 1:48:41 AM     LOG [NestMicroservice] Nest microservice successfully started +172ms
[Nest] 93549  - 05/27/2023, 1:48:41 AM     LOG [ - SERVICE_A/bootstrap - ] 👂🏼 Listening to tcp://localhost:38881
[Nest] 93549  - 05/27/2023, 1:48:41 AM     LOG [RoutesResolver] ServiceAController {/}: +61ms
[Nest] 93549  - 05/27/2023, 1:48:41 AM     LOG [RouterExplorer] Mapped {/ping, GET} route +1ms
[Nest] 93549  - 05/27/2023, 1:48:41 AM     LOG [NestApplication] Nest application successfully started +2ms
[Nest] 93549  - 05/27/2023, 1:48:41 AM     LOG [ - SERVICE_A/bootstrap - ] 🚀 Running on: http://localhost:8881/
```

## :: Microservice B :: Expected Command Result:
```sql
 Info  Webpack is building your sources...

webpack 5.82.1 compiled successfully in 412 ms
Type-checking in progress...
No errors found.
[Nest] 93537  - 05/27/2023, 1:48:41 AM     LOG [NestFactory] Starting Nest application...
[Nest] 93537  - 05/27/2023, 1:48:41 AM     LOG [InstanceLoader] ServiceBModule dependencies initialized +14ms
[Nest] 93537  - 05/27/2023, 1:48:41 AM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +0ms
[Nest] 93537  - 05/27/2023, 1:48:41 AM     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 93537  - 05/27/2023, 1:48:41 AM     LOG [NestMicroservice] Nest microservice successfully started +175ms
[Nest] 93537  - 05/27/2023, 1:48:41 AM     LOG [ - SERVICE_B/bootstrap - ] 👂🏼 Listening to tcp://localhost:38882
[Nest] 93537  - 05/27/2023, 1:48:41 AM     LOG [RoutesResolver] ServiceBController {/}: +54ms
[Nest] 93537  - 05/27/2023, 1:48:41 AM     LOG [RouterExplorer] Mapped {/ping, GET} route +2ms
[Nest] 93537  - 05/27/2023, 1:48:41 AM     LOG [NestApplication] Nest application successfully started +9ms
[Nest] 93537  - 05/27/2023, 1:48:41 AM     LOG [ - SERVICE_B/bootstrap - ] 🚀 Running on: http://localhost:8882/
```
