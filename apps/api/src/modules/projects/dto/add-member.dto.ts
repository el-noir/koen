import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty({ example: 'worker@koen.app' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
