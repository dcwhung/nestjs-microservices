<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<p align="center">An example of building microservices with nestjs framework.</p>

[<< BACK](./step4-4.md) | [INDEX](../README.md)

# Step 5: Modularize TCP connection

## 5.1 - Create interfaces & transports folder under /libs/common/src/ under project root folder
```bash
mkdir ./libs/common/src/interfaces
mkdir ./libs/common/src/transports

# -- Create tcp transport folder -- 
mkdir ./libs/common/src/transports/tcp

# -- Create index file for consolidating all interfaces -- 
touch ./libs/common/src/interfaces/index.ts

# -- Create index file for consolidating all transports -- 
touch ./libs/common/src/transports/index.ts
```

## 5.2.1 - Create interface for module options

```ts
/* -- [CREATE] /libs/common/src/interfaces/common.interface.ts -- */

export interface IModuleOptions {
  name: string;
}
```


## 5.2.2 - Export new interface component to ./libs/common/src/interfaces/index.ts
```ts
export * from './common.interface';
```


## 5.3.1 - Create tcp.module.ts under the transports/tcp folder

```ts
/* -- [CREATE] /libs/common/src/transports/tcp/tcp.module.ts -- */

import { Logger, DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';

import { IModuleOptions } from '@app/common/interfaces';
import { TcpService } from './tcp.service';

@Module({
  imports: [ConfigModule],
  providers: [TcpService],
  exports: [TcpService],
})

export class TcpModule {
  static register(options: IModuleOptions | IModuleOptions[]): DynamicModule {
    const modules = Array.isArray(options) ? options : [options];

    const clients = modules.map(({ name }) => ({
      name,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const tcpService = new TcpService(configService);
        const tcpOptions = tcpService.getOptions(name);
        
        Logger.log(`[ - TcpModule - ] 📝 Registering microservice for ${name} at tcp://${tcpOptions.options.host}:${tcpOptions.options.port}`);

        return {
          transport: tcpOptions.transport,
          options: tcpOptions.options,
        };
      },
    }));

    return {
      module: TcpModule,
      imports: [ClientsModule.registerAsync(clients)],
      exports: [ClientsModule],
    };
  }
}
```


## 5.3.2 - Create tcp.service.ts under the transports/tcp folder

```ts
/* -- [CREATE] /libs/common/src/transports/tcp/tcp.service.ts -- */


import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TcpOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class TcpService {
  constructor(private readonly configService: ConfigService) {}

  getOptions(name: string): TcpOptions {
    /** 
     * To avoid conflict of port number, 
     * Microservice TCP port is set to be based on the HTTP Request Port plus 30000
     * 
     * (i.e. HTTP Request Port is 3000, then Microservice TCP Port will be 33000)
     * 
     */
    
    const httpPort: number = parseInt(this.configService.get<string>(`${name}_PORT`));
    const tcpPort: number = httpPort + 30000;

    return {
      transport: Transport.TCP,
      options: {
        host: this.configService.get<string>(`${name}_HOST`) || '127.0.0.1',
        port: tcpPort,
      },
    };
  }
}
```

## 5.3.3 - Export new transports components to ./libs/common/src/transports/index.ts
```ts
export * from './tcp/tcp.module';
export * from './tcp/tcp.service';
```


## 5.4 - Apply TCPModule to app.module

```ts
/* -- [Update] /apps/api-gateway/src/app.module.ts -- */


import { ConfigModule } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

/* -- [REMOVE] ClientsModule, Transport -- */
// import { ClientsModule, Transport } from "@nestjs/microservices";

import { SHARED_DOT_ENV } from '@app/common/constants';

/* -- [ADD] TcpModule -- */
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
    /* -- 
        [REWRITE] Change registering the microservices by TcpModule, 
        instead of ClientsModule 
    -- 
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
    ]), */
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
```


## 5.5 - Apply TCPService to abstract.microservice.bootstrap.ts

```ts
/* -- [UPDATE] /libs/common/src/abstract/abstract.microservice.bootstrap.ts -- */


import { ConfigService } from '@nestjs/config';
import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

/* -- [REMOVE] Transport -- */
// import { Transport } from '@nestjs/microservices';

/* -- [ADD] TcpService -- */
import { TcpService } from '@app/common/transports';

import { MICROSERVICE_NAME } from '@app/common/constants';

export async function abstractMicroserviceBootstrap(moduleClass: any): Promise<INestApplication> {
  const app = await NestFactory.create(moduleClass);

  const configService = app.get(ConfigService);
  const serviceName = configService.get(MICROSERVICE_NAME);

  const logger = new Logger(` - ${serviceName}/bootstrap - `);

  const servicePort = configService.get(`${serviceName}_PORT`);
  /* -- [UPDATE] retrieving tcpOptions by TcpService -- 
  const tcpOptions = {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 30000 + parseInt(servicePort),
    }
  }; */
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
```


## 5.6 - Running the API-Gateway
```bash
# -- Running API-Gateway -- 
npm run start:dev api-gateway
```

## Expected Command Result:
```sql
 Info  Webpack is building your sources...

webpack 5.82.1 compiled successfully in 574 ms
No errors found.
[Nest] 4760  - 05/28/2023, 11:15:02 PM     LOG [NestFactory] Starting Nest application...
[Nest] 4760  - 05/28/2023, 11:15:02 PM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +15ms
[Nest] 4760  - 05/28/2023, 11:15:02 PM     LOG [InstanceLoader] ConfigModule dependencies initialized +1ms
[Nest] 4760  - 05/28/2023, 11:15:02 PM     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 4760  - 05/28/2023, 11:15:02 PM     LOG [ - TcpModule - ] 📝 Registering microservice for SERVICE_A at tcp://127.0.0.1:38881
[Nest] 4760  - 05/28/2023, 11:15:02 PM     LOG [ - TcpModule - ] 📝 Registering microservice for SERVICE_B at tcp://127.0.0.1:38882
[Nest] 4760  - 05/28/2023, 11:15:02 PM     LOG [InstanceLoader] TcpModule dependencies initialized +1ms
[Nest] 4760  - 05/28/2023, 11:15:02 PM     LOG [InstanceLoader] ClientsModule dependencies initialized +0ms
[Nest] 4760  - 05/28/2023, 11:15:02 PM     LOG [InstanceLoader] AppModule dependencies initialized +0ms
[Nest] 4760  - 05/28/2023, 11:15:02 PM     LOG [RoutesResolver] AppController {/api}: +584ms
[Nest] 4760  - 05/28/2023, 11:15:02 PM     LOG [RouterExplorer] Mapped {/api/ping-all, GET} route +3ms
[Nest] 4760  - 05/28/2023, 11:15:02 PM     LOG [RoutesResolver] SvcAppController {/api}: +0ms
[Nest] 4760  - 05/28/2023, 11:15:02 PM     LOG [RouterExplorer] Mapped {/api/ping-a, GET} route +0ms
[Nest] 4760  - 05/28/2023, 11:15:02 PM     LOG [RoutesResolver] SvcAppController {/api}: +0ms
[Nest] 4760  - 05/28/2023, 11:15:02 PM     LOG [RouterExplorer] Mapped {/api/ping-b, GET} route +1ms
[Nest] 4760  - 05/28/2023, 11:15:02 PM     LOG [NestApplication] Nest application successfully started +2ms
[Nest] 4760  - 05/28/2023, 11:15:02 PM     LOG [ - API Gateway/bootstrap - ] 🚀 Running on: http://localhost:8000/api
```

## 5.7 - Testing API-Gateway with browser or Postman

After starting the applications, you can access to them via the following urls and the only difference is that we have logged the HTTP requests in server-side:

## :: API-Gateway :: - http://localhost:8000/api/ping-all

Expected log result in `API-Gateway` terminal:
```sql
[Nest] 5065  - 05/28/2023, 11:28:47 PM     LOG [ - HTTP Request - ] GET /api/ping-all 200
[Nest] 5065  - 05/28/2023, 11:28:47 PM     LOG [ - API Gateway/AppController - ] /ping-all:: Try to ping all microservices.
[Nest] 5065  - 05/28/2023, 11:28:47 PM     LOG [ - API Gateway/SvcAppService - ] Sending out TCP request to ping SERVICE_A
[Nest] 5065  - 05/28/2023, 11:28:47 PM     LOG [ - API Gateway/SvcAppService - ] Sending out TCP request to ping SERVICE_B
```
