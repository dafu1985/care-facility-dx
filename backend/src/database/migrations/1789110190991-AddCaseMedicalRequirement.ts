import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCaseMedicalRequirement1789110190991 implements MigrationInterface {
    name = 'AddCaseMedicalRequirement1789110190991'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "case_medical_requirement" ("case_medical_requirement_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "placement_case_id" uuid NOT NULL, "medical_condition_id" uuid NOT NULL, "requirement_level" character varying(30) NOT NULL DEFAULT 'NONE', "note" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9184da77b803eb2307676064314" PRIMARY KEY ("case_medical_requirement_id"))`);
        await queryRunner.query(`CREATE INDEX "idx_case_medical_requirement_medical_condition_id" ON "case_medical_requirement" ("medical_condition_id") `);
        await queryRunner.query(`CREATE INDEX "idx_case_medical_requirement_placement_case_id" ON "case_medical_requirement" ("placement_case_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_case_medical_requirement_case_condition" ON "case_medical_requirement" ("placement_case_id", "medical_condition_id") `);
        await queryRunner.query(`ALTER TABLE "case_medical_requirement" ADD CONSTRAINT "FK_2d6d38d69e8ae558254589ceec0" FOREIGN KEY ("placement_case_id") REFERENCES "placement_case"("placement_case_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "case_medical_requirement" ADD CONSTRAINT "FK_5e8084b2d408b8dc772e5c6246b" FOREIGN KEY ("medical_condition_id") REFERENCES "medical_condition_master"("medical_condition_id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case_medical_requirement" DROP CONSTRAINT "FK_5e8084b2d408b8dc772e5c6246b"`);
        await queryRunner.query(`ALTER TABLE "case_medical_requirement" DROP CONSTRAINT "FK_2d6d38d69e8ae558254589ceec0"`);
        await queryRunner.query(`DROP INDEX "public"."uq_case_medical_requirement_case_condition"`);
        await queryRunner.query(`DROP INDEX "public"."idx_case_medical_requirement_placement_case_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_case_medical_requirement_medical_condition_id"`);
        await queryRunner.query(`DROP TABLE "case_medical_requirement"`);
    }

}
