import * as path from 'path';

import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { SHARED_DOT_ENV } from '@app/common/constants';
import { AbstractMicroserviceModule } from '@app/common/abstract/';

import { ServiceBController } from './service-b.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        SHARED_DOT_ENV,
        /** -- Preload individual microservice .env file -- */
        path.join(__dirname.replace('dist/', ''), '.env'),
      ]
    }),
  ],
  controllers: [ServiceBController],
  providers: [],
})
export class ServiceBModule extends AbstractMicroserviceModule {}