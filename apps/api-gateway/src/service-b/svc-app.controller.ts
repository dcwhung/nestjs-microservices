import { Controller, Get } from '@nestjs/common';

import { AbstractHttpRequestController } from '@app/common/abstract/';

import { SvcAppService } from './svc-app.service';

@Controller()
export class SvcAppController extends AbstractHttpRequestController {
  constructor(
    private readonly svcAppService: SvcAppService,
  ) {
    super(SvcAppController.name, svcAppService);
  }

  @Get('/ping-b')
  pingService() {
    return this.ping();
  }
}