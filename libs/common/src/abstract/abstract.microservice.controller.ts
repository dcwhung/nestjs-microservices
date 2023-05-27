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