import { Controller, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AbstractMicroserviceController } from '@app/common/abstract';

@Controller()
export class ServiceAController extends AbstractMicroserviceController {
  constructor(
    @Inject(ConfigService) configService: ConfigService,
  ) {
    super(ServiceAController.name, configService);
  }
}
