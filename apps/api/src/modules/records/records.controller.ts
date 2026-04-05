import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { STAGE1_USER_ID } from '../../constants/stage1-user';

@ApiTags('records')
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: diskStorage({
        destination: './uploads',
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
  ) {
    return this.recordsService.create(dto, file, STAGE1_USER_ID);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all records for a project' })
  findByProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.recordsService.findByProject(projectId, STAGE1_USER_ID);
  }
}
