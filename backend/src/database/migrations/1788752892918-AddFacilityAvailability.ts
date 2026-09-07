import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFacilityAvailability1788752892918 implements MigrationInterface {
    name = 'AddFacilityAvailability1788752892918'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "facility_availability" ("availability_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "facility_id" uuid NOT NULL, "status" character varying(30) NOT NULL DEFAULT 'UNKNOWN', "available_count" integer, "available_from" date, "note" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_7c03f1309752569594202eacf3" UNIQUE ("facility_id"), CONSTRAINT "PK_941b5750e0fd75aba2e42bba3d6" PRIMARY KEY ("availability_id"))`);
        await queryRunner.query(`ALTER TABLE "facility_availability" ADD CONSTRAINT "FK_7c03f1309752569594202eacf33" FOREIGN KEY ("facility_id") REFERENCES "facility"("facility_id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "facility_availability" DROP CONSTRAINT "FK_7c03f1309752569594202eacf33"`);
        await queryRunner.query(`DROP TABLE "facility_availability"`);
    }

}
