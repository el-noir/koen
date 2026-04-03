import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { AiExtractModule } from '../ai-extract/ai-extract.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    AiExtractModule,
  ],
  controllers: [RecordsController],
  providers: [RecordsService],
  exports: [RecordsService],
})
export class RecordsModule { }
