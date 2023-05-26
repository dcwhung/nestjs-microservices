import { delay, of } from 'rxjs';

import { MessagePattern } from '@nestjs/microservices';
import { Controller, Get, Logger } from '@nestjs/common';

@Controller()
export class ServiceBController {
  constructor() {}

  @Get('ping')
  @MessagePattern({ cmd: 'ping' })
  ping(_: any) {
    Logger.log(`Service B :: Someone ping me and I need to pong back~`);
    return of('pong-b').pipe(delay(1000));
  }
}
