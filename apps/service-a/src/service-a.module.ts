import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { SHARED_DOT_ENV } from '@app/common/constants';

import { ServiceAController } from './service-a.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: SHARED_DOT_ENV,
    }),
  ],
  controllers: [ServiceAController],
  providers: [],
})
export class ServiceAModule {}