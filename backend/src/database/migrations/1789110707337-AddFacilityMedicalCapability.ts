import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFacilityMedicalCapability1789110707337 implements MigrationInterface {
    name = 'AddFacilityMedicalCapability1789110707337'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "facility_medical_capability" ("facility_medical_capability_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "facility_id" uuid NOT NULL, "medical_condition_id" uuid NOT NULL, "status" character varying(30) NOT NULL DEFAULT 'CONSULTATION', "note" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2894b09f86956f9f4f3b06d5487" PRIMARY KEY ("facility_medical_capability_id"))`);
        await queryRunner.query(`CREATE INDEX "idx_facility_medical_capability_medical_condition_id" ON "facility_medical_capability" ("medical_condition_id") `);
        await queryRunner.query(`CREATE INDEX "idx_facility_medical_capability_facility_id" ON "facility_medical_capability" ("facility_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_facility_medical_capability_facility_condition" ON "facility_medical_capability" ("facility_id", "medical_condition_id") `);
        await queryRunner.query(`ALTER TABLE "facility_medical_capability" ADD CONSTRAINT "FK_14df80bef50b1389c016f057051" FOREIGN KEY ("facility_id") REFERENCES "facility"("facility_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "facility_medical_capability" ADD CONSTRAINT "FK_24b5b0ec96f00b61bacbafae010" FOREIGN KEY ("medical_condition_id") REFERENCES "medical_condition_master"("medical_condition_id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "facility_medical_capability" DROP CONSTRAINT "FK_24b5b0ec96f00b61bacbafae010"`);
        await queryRunner.query(`ALTER TABLE "facility_medical_capability" DROP CONSTRAINT "FK_14df80bef50b1389c016f057051"`);
        await queryRunner.query(`DROP INDEX "public"."uq_facility_medical_capability_facility_condition"`);
        await queryRunner.query(`DROP INDEX "public"."idx_facility_medical_capability_facility_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_facility_medical_capability_medical_condition_id"`);
        await queryRunner.query(`DROP TABLE "facility_medical_capability"`);
    }

}
