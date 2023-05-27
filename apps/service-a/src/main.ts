import { abstractMicroserviceBootstrap } from '@app/common/abstract';

import { ServiceAModule } from './service-a.module';

async function bootstrap() {
  const app = await abstractMicroserviceBootstrap(ServiceAModule);
}
bootstrap();
