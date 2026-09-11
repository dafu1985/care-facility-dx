import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlacementCase1789107529167 implements MigrationInterface {
  name = 'AddPlacementCase1789107529167';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "placement_case" ("placement_case_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "care_manager_id" uuid NOT NULL, "case_code" character varying(50) NOT NULL, "status" character varying(30) NOT NULL DEFAULT 'SEARCHING', "desired_move_in_date" date, "urgency" character varying(30), "note" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_28ada5caa127e7435c767a55556" PRIMARY KEY ("placement_case_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_placement_case_status" ON "placement_case" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_placement_case_care_manager_id" ON "placement_case" ("care_manager_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_placement_case_case_code" ON "placement_case" ("case_code") `,
    );
    await queryRunner.query(
      `ALTER TABLE "placement_case" ADD CONSTRAINT "FK_772748c69d1c88daf615676aa41" FOREIGN KEY ("care_manager_id") REFERENCES "care_manager"("user_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "placement_case" DROP CONSTRAINT "FK_772748c69d1c88daf615676aa41"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."uq_placement_case_case_code"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_placement_case_care_manager_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_placement_case_status"`);
    await queryRunner.query(`DROP TABLE "placement_case"`);
  }
}
