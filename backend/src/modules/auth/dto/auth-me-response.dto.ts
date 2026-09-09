import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserRole } from '../../users/entities/user.entity';

/**
 * ログインユーザー情報レスポンス。
 *
 * FEがログイン中ユーザーの
 * ID・メールアドレス・ロール・所属施設を
 * 判定するために使用する。
 */
export class AuthMeResponseDto {
  @ApiProperty({
    description: 'ユーザーID',
    example: '1acfc687-32f9-4f32-ac40-c91d9286bfa7',
  })
  userId: string;

  @ApiProperty({
    description: 'メールアドレス',
    example: 'facilitystaff@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'ユーザーロール',
    enum: UserRole,
    example: UserRole.FACILITY,
  })
  role: UserRole;

  @ApiPropertyOptional({
    description:
      '所属施設ID。FACILITYユーザーの場合に設定される。ADMIN・CARE_MANAGERはnull。',
    example: '5ea06a45-7587-4198-b94c-56e0044399c7',
    nullable: true,
  })
  facilityId: string | null;
}
