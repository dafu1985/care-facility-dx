import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClientCondition1789108541690 implements MigrationInterface {
    name = 'AddClientCondition1789108541690'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "client_condition" ("client_condition_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "placement_case_id" uuid NOT NULL, "age_group" character varying(30), "gender" character varying(20), "care_level" character varying(30), "budget_max" integer, "desired_area" character varying(255), "public_assistance" boolean, "guarantor_available" boolean, "dementia" boolean, "end_of_life_care" boolean, "desired_move_in_date" date, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_ff456957d1fe0c8a0a0a5d8dbe" UNIQUE ("placement_case_id"), CONSTRAINT "PK_b5ae6d976280336951af3a2d49e" PRIMARY KEY ("client_condition_id"))`);
        await queryRunner.query(`ALTER TABLE "client_condition" ADD CONSTRAINT "FK_ff456957d1fe0c8a0a0a5d8dbe4" FOREIGN KEY ("placement_case_id") REFERENCES "placement_case"("placement_case_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client_condition" DROP CONSTRAINT "FK_ff456957d1fe0c8a0a0a5d8dbe4"`);
        await queryRunner.query(`DROP TABLE "client_condition"`);
    }

}
