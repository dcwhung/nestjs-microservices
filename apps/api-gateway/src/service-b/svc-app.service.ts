import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { AbstractHttpRequestService } from '@app/common/abstract';

import { MICROSERVICE_NAME } from '.';

@Injectable()
export class SvcAppService extends AbstractHttpRequestService {
  constructor(
    @Inject(MICROSERVICE_NAME) clientService: ClientProxy,
  ) {
    super(MICROSERVICE_NAME, clientService, SvcAppService.name);
  }
}