import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 施設探し案件作成DTO。
 *
 * careManagerId:
 *   ログインユーザーからサーバー側で設定する。
 *
 * caseCode:
 *   サーバー側で自動生成する。
 *
 * status:
 *   作成時はSEARCHINGを初期値として使用する。
 */
export class CreatePlacementCaseDto {
  /**
   * 入居希望日。
   *
   * ISO 8601形式の日付を受け取る。
   * 例: 2026-10-01
   */
  @ApiPropertyOptional({
    description: '入居希望日',
    example: '2026-10-01',
  })
  @IsOptional()
  @IsDateString()
  desiredMoveInDate?: string;

  /**
   * 緊急度。
   *
   * 現段階ではenum化せず文字列として保持する。
   */
  @ApiPropertyOptional({
    description: '案件の緊急度',
    example: 'HIGH',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  urgency?: string;

  /**
   * 案件に関するメモ。
   *
   * 利用者氏名・電話番号など、
   * 不要な直接識別情報は入力しない想定。
   */
  @ApiPropertyOptional({
    description: '案件に関するメモ',
    example: '要介護3。できるだけ早い入居を希望。',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
