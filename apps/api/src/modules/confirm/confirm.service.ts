import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateExtractedDataDto } from './dto/update-confirm.dto';

@Injectable()
export class ConfirmService {
  constructor(private readonly prisma: PrismaService) {}

  async update(id: string, dto: UpdateExtractedDataDto, userId: string) {
    const data = await this.prisma.extractedData.findFirst({
      where: { id, userId },
    });
    if (!data) throw new NotFoundException(`Extracted item ${id} not found`);

    return this.prisma.extractedData.update({
      where: { id },
      data: {
        confirmed: dto.confirmed ?? true,
        ...(dto.content && { content: dto.content }),
      },
    });
  }
}
