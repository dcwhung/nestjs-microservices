import { map } from 'rxjs/operators';

import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @Inject('SERVICE_A') private readonly clientServiceA: ClientProxy,
    @Inject('SERVICE_B') private readonly clientServiceB: ClientProxy,
  ) {}

  pingServiceA() {
    Logger.log(`Sending out TCP request to ping microservice A`);

    const startTs = Date.now();
    const pattern = { cmd: 'ping' };
    const payload = {};

    return this.clientServiceA
      .send<string>(pattern, payload)
      .pipe(
        map((message: string) => ({ message, duration: Date.now() - startTs }))
      );
  }

  pingServiceB() {
    Logger.log(`Sending out TCP request to ping microservice B`);

    const startTs = Date.now();
    const pattern = { cmd: 'ping' };
    const payload = {};

    return this.clientServiceB
      .send<string>(pattern, payload)
      .pipe(
        map((message: string) => ({ message, duration: Date.now() - startTs }))
      );
  }
}