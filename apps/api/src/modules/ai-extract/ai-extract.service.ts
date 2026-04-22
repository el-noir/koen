import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { unlink } from 'fs/promises';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../storage/storage.service';
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
    private readonly storageService: StorageService,
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
    if (!record || !record.audioUrl) return;

    try {
      // Phase 3.6: Get a signed URL if it's a private cloud file
      let processingUrl = record.audioUrl;
      if (record.audioUrl.startsWith('audio/') || record.audioUrl.includes('digitaloceanspaces.com')) {
        try {
          processingUrl = await this.storageService.getDownloadUrl(record.audioUrl);
        } catch (err) {
          this.logger.error(`Failed to sign URL for transcription: ${err.message}`);
          // Fallback to the raw URL if signing fails (might work if public)
        }
      }

      // 1. Transcribe audio using Groq Whisper
      const { text, language } = await this.whisperService.transcribe(processingUrl);
      this.logger.log(`Transcription: ${text}`);

      // Phase 3.7: Fetch historical context (last 3 confirmed items)
      const recentData = await this.prisma.extractedData.findMany({
        where: { projectId: record.projectId, confirmed: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
      });

      const contextString = recentData.length > 0
        ? recentData.map(d => `- [${d.category}]: ${JSON.stringify(d.content)}`).join('\n')
        : 'No previous context available.';

      // 2. Extract structured entities with context
      const entities = await this.extractorService.extract(
        text, 
        record.language || language,
        contextString
      );
      this.logger.log(`Extracted ${entities.length} entities with site context`);

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
            category: entity.category,
            content: entity.content,
            confidence: entity.confidence || 0,
            confirmed: (entity.confidence || 0) >= confidenceThreshold,
          },
        }),
      );

      await Promise.all(createDataPromises);
      this.logger.log(`Finished processing record ${recordId}`);
    } catch (err) {
      this.logger.error(`Failed to process record ${recordId}`, err instanceof Error ? err.stack : err);
    } finally {
      await this.cleanupTemporaryAudio(recordId, record.audioUrl);
    }
  }

  private async cleanupTemporaryAudio(recordId: string, audioPath: string) {
    // Phase 3.6: If it's a cloud path (starts with audio/ or http), keep it in the DB!
    if (!audioPath || audioPath.startsWith('http') || audioPath.startsWith('audio/')) {
      return;
    }

    // Only cleanup local files
    try {
      await unlink(audioPath);
    } catch (err) {
      const fileError = err as NodeJS.ErrnoException;
      if (fileError.code !== 'ENOENT') {
        this.logger.warn(`Could not remove temporary audio for record ${recordId}: ${fileError.message}`);
      }
    }

    try {
      await this.prisma.voiceRecord.update({
        where: { id: recordId },
        data: { audioUrl: '' },
      });
    } catch (err) {
      this.logger.warn(`Could not clear audio path for record ${recordId}`, err as Error);
    }
  }
}
