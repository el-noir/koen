import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { UpdateExtractedDataDto } from './dto/update-confirm.dto';
import { validateConfirmedContent } from './confirm-content.validator';

@Injectable()
export class ConfirmService {
  constructor(private readonly prisma: PrismaService) {}

  async update(id: string, dto: UpdateExtractedDataDto, userId: string) {
    if (dto.confirmed === undefined && dto.content === undefined) {
      throw new BadRequestException('At least one of confirmed or content must be provided.');
    }

    const data = await this.prisma.extractedData.findFirst({
      where: {
        id,
        voiceRecord: {
          project: {
            OR: [
              { userId },
              { members: { some: { userId } } },
            ],
          },
        },
      },
    });
    if (!data) throw new NotFoundException(`Extracted item ${id} not found or access denied`);

    const content = dto.content !== undefined
      ? validateConfirmedContent(data.category, dto.content)
      : undefined;

    return this.prisma.extractedData.update({
      where: { id },
      data: {
        confirmed: dto.confirmed ?? true,
        ...(content && { content: content as unknown as Prisma.InputJsonValue }),
      },
    });
  }
}
