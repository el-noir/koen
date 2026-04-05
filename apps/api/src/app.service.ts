import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot() {
    return {
      name: 'KOEN API',
      stage: 'stage-1',
      status: 'ok',
      docsPath: '/api/docs',
      healthPath: '/api/health',
    };
  }

  getHealth() {
    return {
      status: 'ok',
      service: 'koen-api',
      stage: 'stage-1',
      timestamp: new Date().toISOString(),
    };
  }
}
