import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFacilityRequirement1788754337107 implements MigrationInterface {
    name = 'AddFacilityRequirement1788754337107'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "facility_requirement" ("requirement_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "facility_id" uuid NOT NULL, "min_care_level" integer, "max_care_level" integer, "dementia_accepted" boolean NOT NULL DEFAULT false, "medical_care_accepted" boolean NOT NULL DEFAULT false, "wheelchair_accepted" boolean NOT NULL DEFAULT true, "end_of_life_care" boolean NOT NULL DEFAULT false, "note" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_e0cfc5637e2f824df19575022b" UNIQUE ("facility_id"), CONSTRAINT "PK_69d78db49d5668938fa7931e866" PRIMARY KEY ("requirement_id"))`);
        await queryRunner.query(`ALTER TABLE "facility_requirement" ADD CONSTRAINT "FK_e0cfc5637e2f824df19575022ba" FOREIGN KEY ("facility_id") REFERENCES "facility"("facility_id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "facility_requirement" DROP CONSTRAINT "FK_e0cfc5637e2f824df19575022ba"`);
        await queryRunner.query(`DROP TABLE "facility_requirement"`);
    }

}
