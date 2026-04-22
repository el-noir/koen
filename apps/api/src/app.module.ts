import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { RecordsModule } from './modules/records/records.module';
import { AiExtractModule } from './modules/ai-extract/ai-extract.module';
import { ConfirmModule } from './modules/confirm/confirm.module';
import { AuthModule } from './modules/auth/auth.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { StorageModule } from './modules/storage/storage.module';
import { EmailModule } from './modules/email/email.module';
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
    AuthModule,
    InvitationsModule,
    StorageModule,
    EmailModule,
  ],
})
export class AppModule { }
