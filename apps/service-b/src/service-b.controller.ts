import { Controller, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AbstractMicroserviceController } from '@app/common/abstract';

@Controller()
export class ServiceBController extends AbstractMicroserviceController {
  constructor(
    @Inject(ConfigService) configService: ConfigService,
  ) {
    super(ServiceBController.name, configService);
  }
}
