import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueActiveInquiryPerCandidate1793930400001
  implements MigrationInterface
{
  name = 'AddUniqueActiveInquiryPerCandidate1793930400001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_inquiry_active_candidate_facility"
      ON "inquiry" ("candidate_facility_id")
      WHERE "candidate_facility_id" IS NOT NULL
        AND "status" IN ('OPEN', 'IN_PROGRESS', 'ANSWERED')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "UQ_inquiry_active_candidate_facility"
    `);
  }
}
