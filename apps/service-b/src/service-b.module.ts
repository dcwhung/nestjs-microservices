import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { SHARED_DOT_ENV } from '@app/common/constants';

import { ServiceBController } from './service-b.controller';
import { ServiceBService } from './service-b.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: SHARED_DOT_ENV,
    }),
  ],
  controllers: [ServiceBController],
  providers: [ServiceBService],
})
export class ServiceBModule {}