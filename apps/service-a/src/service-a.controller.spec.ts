import { Test, TestingModule } from '@nestjs/testing';
import { ServiceAController } from './service-a.controller';
import { ServiceAService } from './service-a.service';

describe('ServiceAController', () => {
  let serviceAController: ServiceAController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ServiceAController],
      providers: [ServiceAService],
    }).compile();

    serviceAController = app.get<ServiceAController>(ServiceAController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(serviceAController.getHello()).toBe('Hello World!');
    });
  });
});
