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
    this.logger.log(`Creating record for project ${dto.projectId} - ${file.filename}`);

    // Stage 1 keeps transcript and extracted data, not durable audio storage.
    // The uploaded file path is temporary and cleared after processing.
    const record = await this.prisma.voiceRecord.create({
      data: {
        projectId: dto.projectId,
        userId,
        audioUrl: file.path,
        transcript: '',
        language: dto.language,
        confidenceScore: 0,
      },
    });

    // Trigger AI extraction asynchronously and return immediately for Stage 1.
    this.aiExtractService.processRecord(record.id).catch((err) => {
      this.logger.error(`AI extraction failed for record ${record.id}`, err.stack);
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
