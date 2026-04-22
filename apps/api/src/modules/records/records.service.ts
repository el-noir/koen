import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
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

  async create(dto: CreateRecordDto, file?: Express.Multer.File, userId?: string) {
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

    let audioUrl: string;

    if (dto.cloudKey) {
      // Phase 3.6: Direct Cloud Upload
      this.logger.log(`Processing direct cloud registration for project ${dto.projectId} - ${dto.cloudKey}`);
      audioUrl = dto.cloudKey;
    } else if (file) {
      // Phase 3.3: Traditional Upload Fallback
      this.logger.log(`Processing legacy upload for project ${dto.projectId} - ${file.filename}`);
      audioUrl = await this.storageService.uploadFile(file);
    } else {
      throw new BadRequestException('No audio file or cloud key provided');
    }

    const record = await this.prisma.voiceRecord.create({
      data: {
        projectId: dto.projectId,
        userId: userId || 'system',
        audioUrl,
        transcript: dto.transcript || '',
        language: dto.language,
        confidenceScore: 0,
      },
    });

    // Phase 3.6: Return a signed URL so the frontend can play it immediately
    let signedUrl = record.audioUrl;
    if (record.audioUrl.startsWith('audio/') || record.audioUrl.includes('digitaloceanspaces.com')) {
      try {
        signedUrl = await this.storageService.getDownloadUrl(record.audioUrl);
      } catch (err) {
        this.logger.warn(`Failed to sign URL for new record ${record.id}: ${err.message}`);
      }
    }

    // Trigger AI extraction asynchronously
    this.aiExtractService.processRecord(record.id).catch((err) => {
      this.logger.error(`AI extraction failed for record ${record.id}`, err.stack);
    });

    return presentRecord({ ...record, audioUrl: signedUrl, extracted: [] });
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

    return Promise.all(
      records.map(async (record) => {
        let signedUrl = record.audioUrl;
        
        // Phase 3.6: Generate signed URLs for private storage
        if (record.audioUrl.startsWith('audio/') || record.audioUrl.includes('digitaloceanspaces.com')) {
          try {
            signedUrl = await this.storageService.getDownloadUrl(record.audioUrl);
          } catch (err) {
            this.logger.warn(`Failed to sign URL for record ${record.id}: ${err.message}`);
          }
        }
        
        return presentRecord({
          ...record,
          audioUrl: signedUrl,
        });
      })
    );
  }
}
