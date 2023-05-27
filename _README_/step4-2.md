<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<p align="center">An example of building microservices with nestjs framework.</p>

[<<p BACK](./step4.1.md) | [INDEX](../README.md)

# Step 4: Abstraction

## 2. - Abstraction of *.controller.ts under all microservices

As we want all microservices have ping() method in both HTTP & TCP transport layer to health check its status, so we build an abstract controller class for all microservices as below.


## 2.1.1 - Create abstract.microservice.controller.ts under the abstract folder

```ts
/* -- [CREATE] /libs/common/src/abstract/abstract.microservice.controller.ts -- */


import { delay, of } from 'rxjs';

import { Inject, Get, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagePattern } from '@nestjs/microservices';

import { MICROSERVICE_NAME } from '@app/common/constants';

export abstract class AbstractMicroserviceController {
  protected serviceName: string;
  protected logger: Logger;

  constructor(
    controllerName: string,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    this.serviceName = this.configService.get(MICROSERVICE_NAME);
    this.logger = new Logger(
      ` - ${this.serviceName}/${controllerName} - `
    );
  }

  @Get('/ping')
  @MessagePattern({ cmd: 'ping' })
  ping(_: any) {
    this.logger.log(`Someone ping me and I need to pong back~`);
    return of(`${this.serviceName} - pong: ${Date.now()}`).pipe(delay(1000));
  }
}
```


## 2.1.2 - Export new abstract component to ./libs/common/src/abstract/index.ts
```ts
export * from './abstract.microservice.controller';
```


## 2.2 - Update all microservices *.controller.ts to extend abstract controller file

```ts
/* -- [UPDATE] /apps/service-a/src/service-a.controller.ts -- */


/* -- [REMOVE] delay & of -- */
// import { delay, of } from 'rxjs';

/* -- [REMOVE] MessagePattern -- */
// import { MessagePattern } from '@nestjs/microservices';

/* -- [UPDATE] Remove Get & Logger, add inject -- */
// import { Controller, Get, Logger } from '@nestjs/common';
import { Controller, Inject } from '@nestjs/common';

/* -- [ADD] ConfigService -- */
import { ConfigService } from '@nestjs/config';

/* -- [ADD] Import abstract microservice controller -- */
import { AbstractMicroserviceController } from '@app/common/abstract';

@Controller()
/* -- [ADD] Extends abstract controller class -- */
export class ServiceAController extends AbstractMicroserviceController {
  /* -- 
    [REWRITE] controller calling super constructor
    inject ConfigService for controller using to get config variables
   -- */
  // constructor() {}
  constructor(
    @Inject(ConfigService) configService: ConfigService,
  ) {
    super(ServiceAController.name, configService);
  }

  /* -- [DELETE] original Get() route & ping() method -- 
  @Get('ping')
  @MessagePattern({ cmd: 'ping' })
  ping(_: any) {
    Logger.log(`Service A :: Someone ping me and I need to pong back~`);
    return of('pong-b').pipe(delay(1000));
  } */
}


/* -- [CAUTION!!] Apply the same updates in /apps/service-b/src/service-b.controller.ts -- */
```

## 2.3 - Testing the API-Gateway & Microservices A & B with browser or Postman

After starting the applications, you can access to them via the following urls:

## :: Microservice A :: - http://localhost:8881/ping

Expected result in browser:
```ts
SERVICE_A - pong: 1685224499754
```

Expected log result in terminal:
```sql
[Nest] 95682  - 05/27/2023, 10:54:59 PM     LOG [ - SERVICE_A/ServiceAController - ] Someone ping me and I need to pong back~
```

## :: Microservice B :: - http://localhost:8882/ping

Expected result in browser:
```ts
SERVICE_B - pong: 1685224732971
```

Expected log result in terminal:
```sql
[Nest] 95683  - 05/27/2023, 10:58:52 PM     LOG [ - SERVICE_B/ServiceBController - ] Someone ping me and I need to pong back~
```

## :: API-Gateway :: - http://localhost:8000/api/ping-all

API-Gateway will recieve new format of the pong messages from Microservices A & B, which meant the TCP communication between API-Gateway and the microservices is running correctly.

Expected result in browser:
```json
{
    "pongServiceA": {
        "message": "SERVICE_A - pong: 1685224769383",
        "duration": 1164
    },
    "pongServiceB": {
        "message": "SERVICE_B - pong: 1685224769360",
        "duration": 1124
    }
}
```

Expected log result in terminals:
```sql
# -- API Gateway Terminal -- 
[Nest] 93468  - 05/27/2023, 10:59:29 PM     LOG Sending out TCP request to ping microservice A
[Nest] 93468  - 05/27/2023, 10:59:29 PM     LOG Sending out TCP request to ping microservice B

# -- Microservice A Terminal -- 
[Nest] 95682  - 05/27/2023, 10:59:29 PM     LOG [ - SERVICE_A/ServiceAController - ] Someone ping me and I need to pong back~


# -- Microservice B Terminal -- 
[Nest] 95683  - 05/27/2023, 10:59:29 PM     LOG [ - SERVICE_B/ServiceBController - ] Someone ping me and I need to pong back~
```
