import { map } from 'rxjs/operators';

import { Logger, Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export abstract class AbstractHttpRequestService {
  protected logger: Logger;
  protected serviceName: string;

  constructor(
    @Inject('MICROSERVICE_NAME') protected readonly microserviceName: string,
    protected readonly clientService: ClientProxy,
    providerName: string,
    ) {
    this.serviceName = microserviceName;
    this.logger = new Logger(` - API Gateway/${providerName} - `);
  }

  pingService() {
    this.logger.log(`Sending out TCP request to ping ${this.serviceName}`);
    
    const startTs = Date.now();
    const pattern = { cmd: 'ping' };
    const payload = {};
    
    return this.clientService
      .send<string>(pattern, payload)
      .pipe(
        map((message: string) => ({ message, duration: Date.now() - startTs })),
      );
  }
}