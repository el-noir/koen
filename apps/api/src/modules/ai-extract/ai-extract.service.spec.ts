jest.mock('fs/promises', () => ({
  unlink: jest.fn().mockResolvedValue(undefined),
}));

import { ConfigService } from '@nestjs/config';
import { unlink } from 'fs/promises';
import { PrismaService } from '../../database/prisma.service';
import { AiExtractService } from './ai-extract.service';
import { ExtractorService } from './extractor.service';
import { WhisperService } from './whisper.service';

describe('AiExtractService', () => {
  let service: AiExtractService;
  let prisma: {
    voiceRecord: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    extractedData: {
      create: jest.Mock;
    };
  };
  let configService: {
    get: jest.Mock;
  };
  let whisperService: {
    transcribe: jest.Mock;
  };
  let extractorService: {
    extract: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      voiceRecord: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      extractedData: {
        create: jest.fn(),
      },
    };
    configService = {
      get: jest.fn().mockReturnValue(0.8),
    };
    whisperService = {
      transcribe: jest.fn(),
    };
    extractorService = {
      extract: jest.fn(),
    };

    service = new AiExtractService(
      prisma as unknown as PrismaService,
      configService as unknown as ConfigService,
      whisperService as unknown as WhisperService,
      extractorService as unknown as ExtractorService,
    );
  });

  it('updates the voice record and persists extracted items with auto-confirm logic', async () => {
    prisma.voiceRecord.findUnique.mockResolvedValue({
      id: 'record-1',
      projectId: 'project-1',
      userId: 'stage1-user-id',
      audioUrl: 'uploads/record.webm',
      language: 'en',
    });
    whisperService.transcribe.mockResolvedValue({
      text: 'The plumber is coming tomorrow at 10 in the morning',
      language: 'en',
    });
    extractorService.extract.mockResolvedValue([
      {
        category: 'event',
        content: { description: 'Plumber visit', date: 'tomorrow at 10 in the morning' },
        confidence: 0.95,
      },
      {
        category: 'note',
        content: { text: 'General site reminder' },
        confidence: 0.6,
      },
    ]);
    prisma.extractedData.create
      .mockResolvedValueOnce({ id: 'item-1' })
      .mockResolvedValueOnce({ id: 'item-2' });

    await service.processRecord('record-1');

    expect(whisperService.transcribe).toHaveBeenCalledWith('uploads/record.webm');
    expect(extractorService.extract).toHaveBeenCalledWith(
      'The plumber is coming tomorrow at 10 in the morning',
      'en',
    );
    expect(prisma.voiceRecord.update).toHaveBeenCalledWith({
      where: { id: 'record-1' },
      data: {
        transcript: 'The plumber is coming tomorrow at 10 in the morning',
        language: 'en',
        confidenceScore: 0.95,
      },
    });
    expect(unlink).toHaveBeenCalledWith('uploads/record.webm');
    expect(prisma.voiceRecord.update).toHaveBeenNthCalledWith(2, {
      where: { id: 'record-1' },
      data: { audioUrl: '' },
    });
    expect(prisma.extractedData.create).toHaveBeenNthCalledWith(1, {
      data: {
        voiceRecordId: 'record-1',
        projectId: 'project-1',
        userId: 'stage1-user-id',
        category: 'event',
        content: { description: 'Plumber visit', date: 'tomorrow at 10 in the morning' },
        confidence: 0.95,
        confirmed: true,
      },
    });
    expect(prisma.extractedData.create).toHaveBeenNthCalledWith(2, {
      data: {
        voiceRecordId: 'record-1',
        projectId: 'project-1',
        userId: 'stage1-user-id',
        category: 'note',
        content: { text: 'General site reminder' },
        confidence: 0.6,
        confirmed: false,
      },
    });
  });

  it('returns quietly when the record does not exist', async () => {
    prisma.voiceRecord.findUnique.mockResolvedValue(null);

    await service.processRecord('missing-record');

    expect(whisperService.transcribe).not.toHaveBeenCalled();
    expect(prisma.voiceRecord.update).not.toHaveBeenCalled();
    expect(prisma.extractedData.create).not.toHaveBeenCalled();
  });

  it('returns quietly when the record has no temporary audio path', async () => {
    prisma.voiceRecord.findUnique.mockResolvedValue({
      id: 'record-2',
      projectId: 'project-1',
      userId: 'stage1-user-id',
      audioUrl: '',
      language: 'en',
    });

    await service.processRecord('record-2');

    expect(whisperService.transcribe).not.toHaveBeenCalled();
    expect(prisma.voiceRecord.update).not.toHaveBeenCalled();
    expect(prisma.extractedData.create).not.toHaveBeenCalled();
  });
});
