import { Module } from '@nestjs/common';
import { WhisperService } from './whisper.service';
import { ExtractorService } from './extractor.service';
import { AiExtractService } from './ai-extract.service';

@Module({
  providers: [WhisperService, ExtractorService, AiExtractService],
  exports: [AiExtractService],
})
export class AiExtractModule {}
