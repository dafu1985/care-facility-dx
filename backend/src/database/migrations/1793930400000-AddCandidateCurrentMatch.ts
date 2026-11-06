import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCandidateCurrentMatch1793930400000
  implements MigrationInterface
{
  name = 'AddCandidateCurrentMatch1793930400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "candidate_facility"
      ADD COLUMN "is_current_match" boolean NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "candidate_facility"
      DROP COLUMN "is_current_match"
    `);
  }
}
