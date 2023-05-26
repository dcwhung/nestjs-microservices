<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<p align="center">An example of building microservices with nestjs framework.</p>

[<< BACK](./step1.md) | [INDEX](../README.md) | [NEXT >>]

# Step 2: Setup .env file & apply to apps

## 1. - Create .env file under /libs/common/

```js
API_GATEWAY_PORT = 8000

SERVICE_A_PORT = 8881
SERVICE_B_PORT = 8882
```

## 2. - Create constants folder under /libs/common/ with constants.ts & index.ts

```ts
/* -- [CREATE] /libs/common/src/constants/constants.ts -- */
export const SHARED_DOT_ENV = './libs/common/.env';
```

```ts
/* -- [CREATE] /libs/common/src/constants/index.ts -- */
export * from './constants';
```

## 3.1.1 - Update API-Gateway module file to retrieve port setting from .env file

```ts
/* -- [UPDATE] /apps/api-gateway/src/app.module.ts -- */


/* -- [ADD] Config Module to set .env variables into Config Service -- */
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

/* -- [ADD] Get the .env file path -- */
import { SHARED_DOT_ENV } from '@app/common/constants';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    /* -- [ADD] Setup up the .env in shared library can be access globally -- */ 
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: SHARED_DOT_ENV,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```


## 3.1.2 - Update API-Gateway listening to port assigned in .env file

```ts
/* -- [UPDATE] /apps/api-gateway/src/main.ts -- */


/* -- [ADD] Config Service to load .env variables -- */
import { ConfigService } from '@nestjs/config';

/* -- [ADD] Logger & ValidationPipe -- */
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /* -- [ADD] Set global prefix, so that api-gateway can only available to access under http://host:port/api/ -- */
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe());

  /* -- [ADD] Get API Gateway port from .env config -- */
  const configService = app.get(ConfigService);
  const gatewayPort = configService.get('API_GATEWAY_PORT');

  /* -- [UPDATE] await app.listen(3000); to listen new setting port and output the result in log -- */
  await app.listen(gatewayPort).then(() => {
    Logger.log(
      `[ - API Gateway/bootstrap - ] 🚀 Running on: http://localhost:${gatewayPort}/${globalPrefix}`
    );
  });
}
bootstrap();
```


## 3.1.3 - Test API-Gateway updates 
```sql
# -- Restart the api-gateway (if nodemon is set, then no need to restart, it will automatically restart the service in backend) -- 
$ npm run start:dev api-gateway
```

Expected result in terminal:
```bash
> nestjs-microservices@0.0.1 start:dev
> nest start --watch api-gateway


 Info  Webpack is building your sources...

webpack 5.82.1 compiled successfully in 841 ms
Type-checking in progress...
[Nest] 88218  - 05/26/2023, 3:26:17 PM     LOG [NestFactory] Starting Nest application...
[Nest] 88218  - 05/26/2023, 3:26:18 PM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +94ms
[Nest] 88218  - 05/26/2023, 3:26:18 PM     LOG [InstanceLoader] AppModule dependencies initialized +0ms
[Nest] 88218  - 05/26/2023, 3:26:18 PM     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 88218  - 05/26/2023, 3:26:18 PM     LOG [RoutesResolver] AppController {/api}: +593ms
[Nest] 88218  - 05/26/2023, 3:26:18 PM     LOG [RouterExplorer] Mapped {/api, GET} route +4ms
[Nest] 88218  - 05/26/2023, 3:26:18 PM     LOG [NestApplication] Nest application successfully started +2ms
[Nest] 88218  - 05/26/2023, 3:26:18 PM     LOG [ - API Gateway/bootstrap - ] 🚀 Running on: http://localhost:8000/api
No errors found.
```

After restarting the applications, you can access to api-gateway via:

- API-Gateway - http://localhost:8000/api/

Expected result in browser:
```ts
Hello world!
```


## 3.2.1 - Update Services A & B module files to retrieve port setting from .env file

Same as what we have done in api-gateway, update the *.module.ts files under /apps/service-a/src/ & /apps/service-b/src/

```ts
/* -- [UPDATE] /apps/service-a/src/service-a.module.ts -- */


/* -- [ADD] Config Module to set .env variables into Config Service -- */
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

/* -- [ADD] Get the .env file path -- */
import { SHARED_DOT_ENV } from '@app/common/constants';

import { ServiceAController } from './service-a.controller';
import { ServiceAService } from './service-a.service';

@Module({
  imports: [
    /* -- [ADD] Setup up the .env in shared library can be access globally -- */ 
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: SHARED_DOT_ENV,
    }),
  ],
  controllers: [ServiceAController],
  providers: [ServiceAService],
})
export class ServiceAModule {}


/* -- [CAUTION!!] Apply the same updates in /apps/service-b/src/service-b.module.ts -- */
```


## 3.2.2 - Update Services A & B listening to port assigned in .env file

Same as what we have done in api-gateway, update the main.ts files under /apps/service-a/src/ & /apps/service-b/src/

```ts
/* -- [UPDATE] /apps/service-a/src/main.ts -- */


/* -- [ADD] Config Service to load .env variables -- */
import { ConfigService } from '@nestjs/config';

/* -- [ADD] Logger -- */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ServiceAModule } from './service-a.module';

async function bootstrap() {
  const app = await NestFactory.create(ServiceAModule);

  /* -- [ADD] Get microservice port from .env config -- */
  const configService = app.get(ConfigService);
  const servicePort = configService.get('SERVICE_A_PORT');

  /* -- [UPDATE] await app.listen(3000); to listen new setting port and output the result in log -- */
  await app.listen(servicePort).then(() => {
    Logger.log(
      `[ - Service A/bootstrap - ] 🚀 Running on: http://localhost:${servicePort}`
    );
  });
}
bootstrap();


/* -- [CAUTION!!] Apply the same updates in /apps/service-b/src/main.ts -- */
```

## 3.2.3 - Test Services A & B updates 
```bash
# -- Restart the Services A & B in 2 different terminals -- 

# -- Restart Serice A -- 
$ npm run start:dev service-a

# -- Restart Serice B -- 
$ npm run start:dev service-b
```

After restarting the applications, you can access to api-gateway via:

- Service A - http://localhost:8881/
- Service B - http://localhost:8882/

Expected result in terminal:
```sql
> nestjs-microservices@0.0.1 start:dev
> nest start --watch service-a


 Info  Webpack is building your sources...

webpack 5.82.1 compiled successfully in 669 ms
Type-checking in progress...
[Nest] 88153  - 05/26/2023, 3:24:12 PM     LOG [NestFactory] Starting Nest application...
[Nest] 88153  - 05/26/2023, 3:24:12 PM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +15ms
[Nest] 88153  - 05/26/2023, 3:24:12 PM     LOG [InstanceLoader] ServiceAModule dependencies initialized +0ms
[Nest] 88153  - 05/26/2023, 3:24:12 PM     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 88153  - 05/26/2023, 3:24:12 PM     LOG [RoutesResolver] ServiceAController {/}: +53ms
[Nest] 88153  - 05/26/2023, 3:24:12 PM     LOG [RouterExplorer] Mapped {/, GET} route +2ms
[Nest] 88153  - 05/26/2023, 3:24:12 PM     LOG [NestApplication] Nest application successfully started +1ms
[Nest] 88153  - 05/26/2023, 3:24:12 PM     LOG [ - Service A/bootstrap - ] 🚀 Running on: http://localhost:8881
No errors found.
```

```sql
> nestjs-microservices@0.0.1 start:dev
> nest start --watch service-a


 Info  Webpack is building your sources...

webpack 5.82.1 compiled successfully in 669 ms
Type-checking in progress...
[Nest] 88153  - 05/26/2023, 3:24:12 PM     LOG [NestFactory] Starting Nest application...
[Nest] 88153  - 05/26/2023, 3:24:12 PM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +15ms
[Nest] 88153  - 05/26/2023, 3:24:12 PM     LOG [InstanceLoader] ServiceAModule dependencies initialized +0ms
[Nest] 88153  - 05/26/2023, 3:24:12 PM     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 88153  - 05/26/2023, 3:24:12 PM     LOG [RoutesResolver] ServiceAController {/}: +53ms
[Nest] 88153  - 05/26/2023, 3:24:12 PM     LOG [RouterExplorer] Mapped {/, GET} route +2ms
[Nest] 88153  - 05/26/2023, 3:24:12 PM     LOG [NestApplication] Nest application successfully started +1ms
[Nest] 88153  - 05/26/2023, 3:24:12 PM     LOG [ - Service B/bootstrap - ] 🚀 Running on: http://localhost:8882
No errors found.
```

Expected result in browser:
```ts
Hello world!
```
