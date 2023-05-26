import { delay, of } from 'rxjs';

import { MessagePattern } from '@nestjs/microservices';
import { Controller, Get, Logger } from '@nestjs/common';

@Controller()
export class ServiceAController {
  constructor() {}

  @Get('ping')
  @MessagePattern({ cmd: 'ping' })
  ping(_: any) {
    Logger.log(`Service A :: Someone ping me and I need to pong back~`);
    return of('pong-a').pipe(delay(1000));
  }
}
