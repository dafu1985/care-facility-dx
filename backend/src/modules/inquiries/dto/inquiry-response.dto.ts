import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class InquiryMessageResponseDto {
  @ApiProperty({
    description: 'メッセージID',
    example: '1ea26b9a-f24a-4f07-8802-cae788ecf98f',
  })
  messageId: string;

  @ApiPropertyOptional({
    description: '送信ユーザーID。システムメッセージの場合はnull',
    example: '01541a48-ac15-4279-ac45-166b923f14c9',
    nullable: true,
  })
  senderUserId: string | null;

  @ApiProperty({
    description: 'メッセージ種別',
    example: 'MESSAGE',
  })
  type: string;

  @ApiProperty({
    description: 'メッセージ本文',
    example: '現在2床空いています。来週の見学も可能です。',
  })
  body: string;

  @ApiProperty({
    description: 'メッセージ作成日時',
    example: '2026-09-07T07:17:09.407Z',
  })
  createdAt: Date;
}

export class CreateInquiryResponseDto {
  @ApiProperty({
    description: '問い合わせID',
    example: '808239cf-f7e4-454d-937d-dff4daa00c74',
  })
  inquiryId: string;

  @ApiProperty({
    description: '問い合わせ先施設ID',
    example: '5ea06a45-7587-4198-b94c-56e0044399c7',
  })
  facilityId: string;

  @ApiProperty({
    description: '問い合わせ作成ユーザーID',
    example: '01541a48-ac15-4279-ac45-166b923f14c9',
  })
  createdByUserId: string;

  @ApiProperty({
    description: '問い合わせ件名',
    example: '空き状況について',
  })
  subject: string;

  @ApiProperty({
    description: '問い合わせステータス',
    example: 'OPEN',
  })
  status: string;

  @ApiPropertyOptional({
    description: '最終メッセージ日時',
    example: '2026-09-07T06:20:32.449Z',
    nullable: true,
  })
  lastMessageAt: Date | null;

  @ApiProperty({
    description: '問い合わせ作成日時',
    example: '2026-09-07T06:20:32.438Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '問い合わせ更新日時',
    example: '2026-09-07T06:20:32.438Z',
  })
  updatedAt: Date;
}

export class InquiryResponseDto {
  @ApiProperty({
    description: '問い合わせID',
    example: '808239cf-f7e4-454d-937d-dff4daa00c74',
  })
  inquiryId: string;

  @ApiProperty({
    description: '問い合わせ先施設ID',
    example: '5ea06a45-7587-4198-b94c-56e0044399c7',
  })
  facilityId: string;

  @ApiProperty({
    description: '問い合わせ作成ユーザーID',
    example: '01541a48-ac15-4279-ac45-166b923f14c9',
  })
  createdByUserId: string;

  @ApiProperty({
    description: '問い合わせ件名',
    example: '空き状況について',
  })
  subject: string;

  @ApiProperty({
    description: '問い合わせステータス',
    example: 'ANSWERED',
  })
  status: string;

  @ApiPropertyOptional({
    description: '最後にメッセージまたはステータス変更があった日時',
    example: '2026-09-07T08:06:08.283Z',
    nullable: true,
  })
  lastMessageAt: Date | null;

  @ApiProperty({
    description: '問い合わせ作成日時',
    example: '2026-09-07T06:20:32.438Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '問い合わせ更新日時',
    example: '2026-09-07T08:06:08.283Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'メッセージ履歴',
    type: () => InquiryMessageResponseDto,
    isArray: true,
  })
  messages: InquiryMessageResponseDto[];
}

export class InquiryListItemResponseDto {
  @ApiProperty({
    description: '問い合わせID',
    example: '808239cf-f7e4-454d-937d-dff4daa00c74',
  })
  inquiryId: string;

  @ApiProperty({
    description: '問い合わせ先施設ID',
    example: '5ea06a45-7587-4198-b94c-56e0044399c7',
  })
  facilityId: string;

  @ApiProperty({
    description: '問い合わせ作成ユーザーID',
    example: '01541a48-ac15-4279-ac45-166b923f14c9',
  })
  createdByUserId: string;

  @ApiProperty({
    description: '問い合わせ件名',
    example: '空き状況について',
  })
  subject: string;

  @ApiProperty({
    description: '問い合わせステータス',
    example: 'ANSWERED',
  })
  status: string;

  @ApiPropertyOptional({
    description: '最後にやり取りがあった日時',
    example: '2026-09-07T08:06:08.283Z',
    nullable: true,
  })
  lastMessageAt: Date | null;

  @ApiProperty({
    description: '問い合わせ作成日時',
    example: '2026-09-07T06:20:32.438Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '問い合わせ更新日時',
    example: '2026-09-07T08:06:08.283Z',
  })
  updatedAt: Date;
}

export class InquiryListResponseDto {
  @ApiProperty({
    description: '問い合わせ一覧',
    type: () => InquiryListItemResponseDto,
    isArray: true,
  })
  items: InquiryListItemResponseDto[];

  @ApiProperty({
    description: '現在のページ番号',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '1ページあたりの件数',
    example: 20,
  })
  pageSize: number;

  @ApiProperty({
    description: '検索条件に一致した総件数',
    example: 2,
  })
  total: number;
}