import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCandidateFacility1789111155327 implements MigrationInterface {
    name = 'AddCandidateFacility1789111155327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "candidate_facility" ("candidate_facility_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "placement_case_id" uuid NOT NULL, "facility_id" uuid NOT NULL, "match_score" integer, "status" character varying(30) NOT NULL DEFAULT 'CONSIDERING', "note" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_85eba218290778f5ecebdcd9be6" PRIMARY KEY ("candidate_facility_id"))`);
        await queryRunner.query(`CREATE INDEX "idx_candidate_facility_status" ON "candidate_facility" ("status") `);
        await queryRunner.query(`CREATE INDEX "idx_candidate_facility_facility_id" ON "candidate_facility" ("facility_id") `);
        await queryRunner.query(`CREATE INDEX "idx_candidate_facility_placement_case_id" ON "candidate_facility" ("placement_case_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_candidate_facility_case_facility" ON "candidate_facility" ("placement_case_id", "facility_id") `);
        await queryRunner.query(`ALTER TABLE "candidate_facility" ADD CONSTRAINT "FK_f34480b77893f33de099e96b6e1" FOREIGN KEY ("placement_case_id") REFERENCES "placement_case"("placement_case_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "candidate_facility" ADD CONSTRAINT "FK_a259406114e4c6c60f60a19d0de" FOREIGN KEY ("facility_id") REFERENCES "facility"("facility_id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "candidate_facility" DROP CONSTRAINT "FK_a259406114e4c6c60f60a19d0de"`);
        await queryRunner.query(`ALTER TABLE "candidate_facility" DROP CONSTRAINT "FK_f34480b77893f33de099e96b6e1"`);
        await queryRunner.query(`DROP INDEX "public"."uq_candidate_facility_case_facility"`);
        await queryRunner.query(`DROP INDEX "public"."idx_candidate_facility_placement_case_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_candidate_facility_facility_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_candidate_facility_status"`);
        await queryRunner.query(`DROP TABLE "candidate_facility"`);
    }

}
