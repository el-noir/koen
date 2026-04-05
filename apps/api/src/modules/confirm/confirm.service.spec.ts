import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfirmService } from './confirm.service';
import { PrismaService } from '../../database/prisma.service';

describe('ConfirmService', () => {
  let service: ConfirmService;
  let prisma: {
    extractedData: {
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      extractedData: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    service = new ConfirmService(prisma as unknown as PrismaService);
  });

  it('confirms an extracted item by default when only confirmed is omitted', async () => {
    prisma.extractedData.findFirst.mockResolvedValue({
      id: 'item-1',
      userId: 'stage1-user-id',
      category: 'task',
      content: { description: 'Install framing' },
      confirmed: false,
    });
    prisma.extractedData.update.mockResolvedValue({
      id: 'item-1',
      confirmed: true,
      content: { description: 'Install framing' },
    });

    const result = await service.update(
      'item-1',
      { content: { description: 'Install framing' } },
      'stage1-user-id',
    );

    expect(prisma.extractedData.update).toHaveBeenCalledWith({
      where: { id: 'item-1' },
      data: {
        confirmed: true,
        content: { description: 'Install framing' },
      },
    });
    expect(result).toEqual({
      id: 'item-1',
      confirmed: true,
      content: { description: 'Install framing' },
    });
  });

  it('preserves an explicit confirmed false value while updating content', async () => {
    prisma.extractedData.findFirst.mockResolvedValue({
      id: 'item-2',
      userId: 'stage1-user-id',
      category: 'note',
      content: { text: 'Original note' },
      confirmed: false,
    });
    prisma.extractedData.update.mockResolvedValue({
      id: 'item-2',
      confirmed: false,
      content: { text: 'Updated note' },
    });

    await service.update(
      'item-2',
      { confirmed: false, content: { text: 'Updated note' } },
      'stage1-user-id',
    );

    expect(prisma.extractedData.update).toHaveBeenCalledWith({
      where: { id: 'item-2' },
      data: {
        confirmed: false,
        content: { text: 'Updated note' },
      },
    });
  });

  it('rejects empty confirmation requests', async () => {
    await expect(
      service.update('item-3', {}, 'stage1-user-id'),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects missing items for the current user', async () => {
    prisma.extractedData.findFirst.mockResolvedValue(null);

    await expect(
      service.update('missing-item', { confirmed: true }, 'stage1-user-id'),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects invalid content for the item category', async () => {
    prisma.extractedData.findFirst.mockResolvedValue({
      id: 'item-4',
      userId: 'stage1-user-id',
      category: 'hours',
      content: { start: '08:00', end: '17:00' },
      confirmed: false,
    });

    await expect(
      service.update(
        'item-4',
        { content: { start: '08:00', end: '17:00', workers: 0 } },
        'stage1-user-id',
      ),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.extractedData.update).not.toHaveBeenCalled();
  });
});
