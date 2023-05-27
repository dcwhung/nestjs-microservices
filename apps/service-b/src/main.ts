import { abstractMicroserviceBootstrap } from '@app/common/abstract';

import { ServiceBModule } from './service-b.module';

async function bootstrap() {
  const app = await abstractMicroserviceBootstrap(ServiceBModule);
}
bootstrap();
