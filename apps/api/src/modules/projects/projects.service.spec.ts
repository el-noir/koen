import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ProjectsService } from './projects.service';
import { ProjectStage } from './dto/create-project.dto';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: {
    project: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      project: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    service = new ProjectsService(prisma as unknown as PrismaService);
  });

  it('creates a project for the current Stage 1 user', async () => {
    prisma.project.create.mockResolvedValue({
      id: 'project-1',
      userId: 'stage1-user-id',
      name: 'Sample Site',
    });

    await service.create(
      {
        name: 'Sample Site',
        client: 'Apex Builders',
        startDate: '2026-04-05',
        stage: ProjectStage.FRAMING,
      },
      'stage1-user-id',
    );

    expect(prisma.project.create).toHaveBeenCalledWith({
      data: {
        name: 'Sample Site',
        client: 'Apex Builders',
        startDate: new Date('2026-04-05'),
        stage: ProjectStage.FRAMING,
        userId: 'stage1-user-id',
      },
    });
  });

  it('lists only projects for the requested user ordered newest first', async () => {
    prisma.project.findMany.mockResolvedValue([]);

    await service.findAll('stage1-user-id');

    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: { userId: 'stage1-user-id' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('returns a project with presented records', async () => {
    prisma.project.findFirst.mockResolvedValue({
      id: 'project-2',
      userId: 'stage1-user-id',
      name: 'Site Two',
      client: 'Builder Co',
      startDate: new Date('2026-04-05'),
      stage: ProjectStage.FOUNDATIONS,
      records: [
        {
          id: 'record-1',
          transcript: '',
          extracted: [],
          createdAt: new Date('2026-04-05T10:00:00Z'),
        },
        {
          id: 'record-2',
          transcript: 'Plumber arrives tomorrow',
          extracted: [{ id: 'item-1', confirmed: false }],
          createdAt: new Date('2026-04-05T11:00:00Z'),
        },
      ],
    });

    const result = await service.findOne('project-2', 'stage1-user-id');

    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: { id: 'project-2', userId: 'stage1-user-id' },
      include: {
        records: {
          include: { extracted: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    expect(result.records).toEqual([
      expect.objectContaining({
        id: 'record-1',
        processingStatus: 'processing',
      }),
      expect.objectContaining({
        id: 'record-2',
        processingStatus: 'needs_confirmation',
      }),
    ]);
  });

  it('throws when the project is not found for the current user', async () => {
    prisma.project.findFirst.mockResolvedValue(null);

    await expect(
      service.findOne('missing-project', 'stage1-user-id'),
    ).rejects.toThrow(NotFoundException);
  });

  it('updates a project after verifying access', async () => {
    prisma.project.findFirst.mockResolvedValue({
      id: 'project-3',
      userId: 'stage1-user-id',
      name: 'Original Site',
      records: [],
    });
    prisma.project.update.mockResolvedValue({
      id: 'project-3',
      name: 'Updated Site',
    });

    await service.update(
      'project-3',
      {
        name: 'Updated Site',
        startDate: '2026-05-01',
      },
      'stage1-user-id',
    );

    expect(prisma.project.update).toHaveBeenCalledWith({
      where: { id: 'project-3' },
      data: {
        name: 'Updated Site',
        startDate: new Date('2026-05-01'),
      },
    });
  });

  it('deletes a project after verifying access', async () => {
    prisma.project.findFirst.mockResolvedValue({
      id: 'project-4',
      userId: 'stage1-user-id',
      name: 'Delete Me',
      records: [],
    });
    prisma.project.delete.mockResolvedValue({ id: 'project-4' });

    await service.remove('project-4', 'stage1-user-id');

    expect(prisma.project.delete).toHaveBeenCalledWith({
      where: { id: 'project-4' },
    });
  });
});
