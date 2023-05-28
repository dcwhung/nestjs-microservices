import { Module } from '@nestjs/common';
import { SvcAppController } from './svc-app.controller';
import { SvcAppService } from './svc-app.service';

@Module({
  imports: [],
  controllers: [SvcAppController],
  providers: [SvcAppService],
})
export class SvcAppModule {}
