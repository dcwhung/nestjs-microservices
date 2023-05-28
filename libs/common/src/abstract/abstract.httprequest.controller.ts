import { Logger, Controller } from '@nestjs/common';

@Controller()
export abstract class AbstractHttpRequestController {
  protected logger: Logger;

  constructor(
    controllerName: string,
    private readonly service: any,
  ) {
    this.logger = new Logger(` - API-Gateway/${controllerName} - `);
  }

  protected ping() {
    this.logger.log(`Try to ping ${this.service.serviceName}`);
    return this.service.pingService();
  }
}