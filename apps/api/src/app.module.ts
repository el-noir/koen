import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { RecordsModule } from './modules/records/records.module';
import { AiExtractModule } from './modules/ai-extract/ai-extract.module';
import { ConfirmModule } from './modules/confirm/confirm.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      load: [configuration],
    }),
    PrismaModule,
    ProjectsModule,
    RecordsModule,
    AiExtractModule,
    ConfirmModule,
  ],
})
export class AppModule { }
