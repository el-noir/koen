import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseUUIDPipe,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RecordsService } from './records.service';
import { StorageService } from '../storage/storage.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { ensureTempUploadsDir } from './uploads-path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, UserContext } from '../auth/decorators/current-user.decorator';

@ApiTags('records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('records')
export class RecordsController {
  constructor(
    private readonly recordsService: RecordsService,
    private readonly storageService: StorageService,
  ) {}

  @Get('upload-url')
  @ApiOperation({ summary: 'Get a presigned URL for direct cloud upload' })
  async getUploadUrl(
    @Query('projectId') projectId: string,
    @Query('filename') filename: string,
  ) {
    const key = `audio/${projectId}/${Date.now()}-${filename}`;
    const url = await this.storageService.getUploadUrl(key);
    return { url, key };
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, ensureTempUploadsDir());
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload audio file for processing' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audio: { type: 'string', format: 'binary' },
        projectId: { type: 'string' },
        language: { type: 'string', enum: ['en', 'es'] },
      },
    },
  })
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateRecordDto,
    @CurrentUser() user: UserContext,
  ) {
    return this.recordsService.create(dto, file, user.userId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all records for a project' })
  findByProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @CurrentUser() user: UserContext,
  ) {
    return this.recordsService.findByProject(projectId, user.userId);
  }
}
