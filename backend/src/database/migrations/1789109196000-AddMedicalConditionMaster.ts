import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMedicalConditionMaster1789109196000 implements MigrationInterface {
    name = 'AddMedicalConditionMaster1789109196000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "medical_condition_master" ("medical_condition_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(50) NOT NULL, "name" character varying(100) NOT NULL, "display_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_53fb1328771711b4dbf7e84808e" PRIMARY KEY ("medical_condition_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_medical_condition_master_code" ON "medical_condition_master" ("code") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."uq_medical_condition_master_code"`);
        await queryRunner.query(`DROP TABLE "medical_condition_master"`);
    }

}
