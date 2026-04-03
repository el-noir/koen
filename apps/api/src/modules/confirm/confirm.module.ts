import { Module } from '@nestjs/common';
import { ConfirmService } from './confirm.service';
import { ConfirmController } from './confirm.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConfirmController],
  providers: [ConfirmService],
  exports: [ConfirmService],
})
export class ConfirmModule {}
