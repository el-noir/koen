import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ description: 'The invitation token received via email' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ example: 'Mudasir Shah' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'securepassword123' })
  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  password: string;
}
