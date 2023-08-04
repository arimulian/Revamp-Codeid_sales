import { Test, TestingModule } from '@nestjs/testing';
import { FintechController } from './fintech.controller';

describe('FintechController', () => {
  let controller: FintechController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FintechController],
    }).compile();

    controller = module.get<FintechController>(FintechController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
