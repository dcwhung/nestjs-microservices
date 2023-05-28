

import { map, zip } from 'rxjs';

import { Controller, Get, Logger } from '@nestjs/common';

import * as ServiceA from './service-a/';
import * as ServiceB from './service-b/';

@Controller()
export class AppController {
  protected logger: Logger;

  constructor(
    private readonly serviceA: ServiceA.SvcAppService,
    private readonly serviceB: ServiceB.SvcAppService,
  ) {
    this.logger = new Logger(` - API Gateway/${AppController.name} - `);
  }

  @Get('/ping-all')
  async pingAll() {
    this.logger.log('/ping-all:: Try to ping all microservices.');

    return zip(
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