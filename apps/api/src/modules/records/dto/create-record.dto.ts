import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AudioLanguage {
  EN = 'en',
  ES = 'es',
}

export class CreateRecordDto {
  @ApiProperty({ example: 'projectId-uuid' })
  @IsString()
  projectId: string;

  @ApiProperty({ enum: AudioLanguage, example: AudioLanguage.EN })
  @IsEnum(AudioLanguage)
  language: AudioLanguage;

  @ApiProperty({ example: 'optional transcription if already done', required: false })
  @IsString()
  @IsOptional()
  transcript?: string;
}
