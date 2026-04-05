import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { AiExtractModule } from '../ai-extract/ai-extract.module';
import { ensureTempUploadsDir } from './uploads-path';

@Module({
  imports: [
    MulterModule.register({
      dest: ensureTempUploadsDir(),
    }),
    AiExtractModule,
  ],
  controllers: [RecordsController],
  providers: [RecordsService],
  exports: [RecordsService],
})
export class RecordsModule {}
