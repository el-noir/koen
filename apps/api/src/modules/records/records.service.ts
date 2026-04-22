import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

import { CreateRecordDto } from './dto/create-record.dto';
import { StorageService } from '../storage/storage.service';
import { AiExtractService } from '../ai-extract/ai-extract.service';
import { presentRecord } from './record-presenter';

@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiExtractService: AiExtractService,
    private readonly storageService: StorageService,
  ) { }

  async create(dto: CreateRecordDto, file: Express.Multer.File, userId: string) {
    // Phase 3.4: Verify membership before uploading
    const project = await this.prisma.project.findFirst({
      where: {
        id: dto.projectId,
        OR: [
          { userId },
          { members: { some: { userId } } },
        ],
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found or you do not have permission to record for it');
    }

    this.logger.log(`Processing upload for project ${dto.projectId} - ${file.filename}`);

    // Phase 3.3: Upload to cloud storage (DO Spaces)
    const cloudUrl = await this.storageService.uploadFile(file);

    const record = await this.prisma.voiceRecord.create({
      data: {
        projectId: dto.projectId,
        userId,
        audioUrl: cloudUrl,
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
    // Phase 3.4: Verify membership before returning records
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          { members: { some: { userId } } },
        ],
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found or access denied');
    }

    const records = await this.prisma.voiceRecord.findMany({
      where: { projectId },
      include: { extracted: true },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => presentRecord(record));
  }
}
