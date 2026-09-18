import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInquiryReadStatus1789736400000
  implements MigrationInterface
{
  name = 'AddInquiryReadStatus1789736400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "inquiry_read_status" (
        "inquiry_read_status_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "inquiry_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "last_read_at" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),

        CONSTRAINT "PK_inquiry_read_status"
          PRIMARY KEY ("inquiry_read_status_id"),

        CONSTRAINT "UQ_inquiry_read_status_inquiry_user"
          UNIQUE ("inquiry_id", "user_id"),

        CONSTRAINT "FK_inquiry_read_status_inquiry"
          FOREIGN KEY ("inquiry_id")
          REFERENCES "inquiry"("inquiry_id")
          ON DELETE CASCADE,

        CONSTRAINT "FK_inquiry_read_status_user"
          FOREIGN KEY ("user_id")
          REFERENCES "app_user"("user_id")
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_inquiry_read_status_user_id"
      ON "inquiry_read_status" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_inquiry_read_status_inquiry_id"
      ON "inquiry_read_status" ("inquiry_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_inquiry_read_status_inquiry_id"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_inquiry_read_status_user_id"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "inquiry_read_status"
    `);
  }
}