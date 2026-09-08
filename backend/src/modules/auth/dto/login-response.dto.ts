import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWTアクセストークン',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'ユーザーID',
    example: '01541a48-ac15-4279-ac45-166b923f14c9',
  })
  userId: string;

  @ApiProperty({
    description: 'ユーザーのロール',
    example: 'CARE_MANAGER',
  })
  role: string;

  @ApiProperty({
    description: 'メールアドレス',
    example: 'caremanager@example.com',
  })
  email: string;
}