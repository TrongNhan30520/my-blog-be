import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendOTPDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
