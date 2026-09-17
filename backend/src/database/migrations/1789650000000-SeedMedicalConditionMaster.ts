import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedMedicalConditionMaster1789650000000
  implements MigrationInterface
{
  name = 'SeedMedicalConditionMaster1789650000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "medical_condition_master"
        ("code", "name", "display_order", "is_active")
      VALUES
        ('GASTROSTOMY', '胃ろう', 1, true),
        ('NASOGASTRIC_FEEDING', '経鼻経管栄養', 2, true),
        ('IVH', '中心静脈栄養（IVH）', 3, true),
        ('INSULIN', 'インスリン', 4, true),
        ('HOME_OXYGEN', '在宅酸素', 5, true),
        ('SUCTION', 'たん吸引', 6, true),
        ('DIALYSIS', '人工透析', 7, true),
        ('STOMA', 'ストーマ', 8, true),
        ('URINARY_CATHETER', '尿道カテーテル', 9, true),
        ('TRACHEOSTOMY', '気管切開', 10, true),
        ('VENTILATOR', '人工呼吸器', 11, true),
        ('PRESSURE_ULCER', '褥瘡', 12, true),
        ('TERMINAL_CARE', '終末期ケア', 13, true)
      ON CONFLICT ("code")
      DO UPDATE SET
        "name" = EXCLUDED."name",
        "display_order" = EXCLUDED."display_order",
        "is_active" = EXCLUDED."is_active",
        "updated_at" = now()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "medical_condition_master"
      WHERE "code" IN (
        'GASTROSTOMY',
        'NASOGASTRIC_FEEDING',
        'IVH',
        'INSULIN',
        'HOME_OXYGEN',
        'SUCTION',
        'DIALYSIS',
        'STOMA',
        'URINARY_CATHETER',
        'TRACHEOSTOMY',
        'VENTILATOR',
        'PRESSURE_ULCER',
        'TERMINAL_CARE'
      )
    `);
  }
}