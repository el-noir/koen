import { AiExtractService } from '../ai-extract/ai-extract.service';
import { PrismaService } from '../../database/prisma.service';
import { RecordsService } from './records.service';
import { AudioLanguage } from './dto/create-record.dto';

describe('RecordsService', () => {
  let service: RecordsService;
  let prisma: {
    voiceRecord: {
      create: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let aiExtractService: {
    processRecord: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      voiceRecord: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };
    aiExtractService = {
      processRecord: jest.fn().mockResolvedValue(undefined),
    };

    service = new RecordsService(
      prisma as unknown as PrismaService,
      aiExtractService as unknown as AiExtractService,
    );
  });

  it('creates a record and triggers background AI processing', async () => {
    prisma.voiceRecord.create.mockResolvedValue({
      id: 'record-1',
      projectId: 'project-1',
      userId: 'stage1-user-id',
      audioUrl: 'uploads/record.webm',
      transcript: '',
      language: 'en',
      confidenceScore: 0,
      createdAt: new Date('2026-04-05T10:00:00Z'),
    });

    const result = await service.create(
      { projectId: 'project-1', language: AudioLanguage.EN },
      { path: 'uploads/record.webm', filename: 'record.webm' } as Express.Multer.File,
      'stage1-user-id',
    );

    expect(prisma.voiceRecord.create).toHaveBeenCalledWith({
      data: {
        projectId: 'project-1',
        userId: 'stage1-user-id',
        audioUrl: 'uploads/record.webm',
        transcript: '',
        language: 'en',
        confidenceScore: 0,
      },
    });
    expect(aiExtractService.processRecord).toHaveBeenCalledWith('record-1');
    expect(result).toEqual(
      expect.objectContaining({
        id: 'record-1',
        processingStatus: 'processing',
        extracted: [],
      }),
    );
  });

  it('lists records for a project with presented processing status', async () => {
    prisma.voiceRecord.findMany.mockResolvedValue([
      {
        id: 'record-2',
        projectId: 'project-1',
        userId: 'stage1-user-id',
        audioUrl: 'uploads/record-2.webm',
        transcript: 'Concrete pour booked for Friday',
        language: 'en',
        confidenceScore: 0.93,
        createdAt: new Date('2026-04-05T11:00:00Z'),
        extracted: [{ id: 'item-1', confirmed: true }],
      },
    ]);

    const result = await service.findByProject('project-1', 'stage1-user-id');

    expect(prisma.voiceRecord.findMany).toHaveBeenCalledWith({
      where: { projectId: 'project-1', userId: 'stage1-user-id' },
      include: { extracted: true },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toEqual([
      expect.objectContaining({
        id: 'record-2',
        processingStatus: 'processed',
      }),
    ]);
  });
});
