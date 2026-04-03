import { IsBoolean, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateExtractedDataDto {
  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  confirmed?: boolean;

  @ApiProperty({ example: { description: 'Updated task' }, required: false })
  @IsObject()
  @IsOptional()
  content?: any;
}
