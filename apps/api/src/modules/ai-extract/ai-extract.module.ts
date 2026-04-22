import { Module } from '@nestjs/common';
import { WhisperService } from './whisper.service';
import { ExtractorService } from './extractor.service';
import { AiExtractService } from './ai-extract.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [WhisperService, ExtractorService, AiExtractService],
  exports: [AiExtractService],
})
export class AiExtractModule {}
