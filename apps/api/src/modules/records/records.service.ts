import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { AiExtractService } from '../ai-extract/ai-extract.service';
import { presentRecord } from './record-presenter';

@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiExtractService: AiExtractService,
  ) {}

  async create(dto: CreateRecordDto, file: Express.Multer.File, userId: string) {
    this.logger.log(`Creating record for project ${dto.projectId} — ${file.filename}`);

    // Create the VoiceRecord entry first (Stage 1 uses local file path)
    const record = await this.prisma.voiceRecord.create({
      data: {
        projectId: dto.projectId,
        userId,
        audioUrl: file.path,      // Path on local disk (for Stage 1)
        transcript: '',           // Filled after transcription
        language: dto.language,
        confidenceScore: 0,
      },
    });

    // Trigger AI Extraction asynchronously
    // In Stage 1, we return the record immediately and process in background
    this.aiExtractService.processRecord(record.id).catch((err) => {
      this.logger.error(`AI Extraction failed for record ${record.id}`, err.stack);
    });

    return presentRecord({ ...record, extracted: [] });
  }

  async findByProject(projectId: string, userId: string) {
    const records = await this.prisma.voiceRecord.findMany({
      where: { projectId, userId },
      include: { extracted: true },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => presentRecord(record));
  }
}
