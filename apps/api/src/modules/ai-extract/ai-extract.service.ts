import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { WhisperService } from './whisper.service';
import { ExtractorService } from './extractor.service';

@Injectable()
export class AiExtractService {
  private readonly logger = new Logger(AiExtractService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly whisperService: WhisperService,
    private readonly extractorService: ExtractorService,
  ) {}

  /**
   * Main pipeline: Groq Whisper -> Groq extraction -> Database Store
   */
  async processRecord(recordId: string) {
    this.logger.log(`Starting AI extraction for record ${recordId}`);
    const confidenceThreshold =
      this.configService.get<number>('confidenceThreshold') ?? 0.8;

    const record = await this.prisma.voiceRecord.findUnique({
      where: { id: recordId },
    });
    if (!record) return;

    try {
      // 1. Transcribe audio using Groq Whisper
      const { text, language } = await this.whisperService.transcribe(record.audioUrl);
      this.logger.log(`Transcription: ${text}`);

      // 2. Extract structured entities using Llama-3 (Groq)
      const entities = await this.extractorService.extract(text, record.language || language);
      this.logger.log(`Extracted ${entities.length} entities`);

      // 3. Update the record with transcript
      await this.prisma.voiceRecord.update({
        where: { id: recordId },
        data: {
          transcript: text,
          language,
          confidenceScore:
            entities.length > 0
              ? Math.max(...entities.map((entity) => entity.confidence || 0))
              : 0,
        },
      });

      // 4. Store extracted data in the database
      const createDataPromises = entities.map((entity) =>
        this.prisma.extractedData.create({
          data: {
            voiceRecordId: recordId,
            projectId: record.projectId,
            userId: record.userId,
            category: entity.category, // e.g., 'task', 'material'
            content: entity.content,   // JSON object
            confidence: entity.confidence || 0,
            confirmed: (entity.confidence || 0) >= confidenceThreshold,
          },
        }),
      );

      await Promise.all(createDataPromises);
      this.logger.log(`Finished processing record ${recordId}`);
    } catch (err) {
      this.logger.error(`Failed to process record ${recordId}`, err);
    }
  }
}
