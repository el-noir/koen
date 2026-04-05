import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the KOEN API status payload', () => {
      expect(appController.getRoot()).toEqual({
        name: 'KOEN API',
        stage: 'stage-1',
        status: 'ok',
        docsPath: '/api/docs',
        healthPath: '/api/health',
      });
    });

    it('should return the KOEN API health payload', () => {
      expect(appController.getHealth()).toMatchObject({
        status: 'ok',
        service: 'koen-api',
        stage: 'stage-1',
      });
    });
  });
});
