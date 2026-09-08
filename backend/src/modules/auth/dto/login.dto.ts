import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'ログイン用メールアドレス',
    example: 'caremanager@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'ログインパスワード',
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}