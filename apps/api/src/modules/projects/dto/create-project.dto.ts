import { IsString, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ProjectStage {
  FOUNDATIONS = 'foundations',
  FRAMING = 'framing',
  CLADDING = 'cladding',
  FINISHING = 'finishing',
}

export class CreateProjectDto {
  @ApiProperty({ example: 'Bendigo Renovation' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Alonso Avalos' })
  @IsString()
  client: string;

  @ApiProperty({ example: '2026-04-03' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ enum: ProjectStage, example: ProjectStage.FRAMING })
  @IsEnum(ProjectStage)
  stage: ProjectStage;
}
