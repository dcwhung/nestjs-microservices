import * as path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SHARED_DOT_ENV } from '@app/common/constants';
import { AbstractMicroserviceModule } from '@app/common/abstract/';

import { ServiceAController } from './service-a.controller';

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
  controllers: [ServiceAController],
  providers: [],
})
export class ServiceAModule extends AbstractMicroserviceModule {}
