import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFacilityStaff1788835703488 implements MigrationInterface {
    name = 'AddFacilityStaff1788835703488'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "facility_staff" ("facility_staff_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "facility_id" uuid NOT NULL, "role" character varying(30) NOT NULL DEFAULT 'STAFF', "status" character varying(30) NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_735a1f032f26857a74780abe5c4" PRIMARY KEY ("facility_staff_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_facility_staff_user_facility" ON "facility_staff" ("user_id", "facility_id") `);
        await queryRunner.query(`ALTER TABLE "facility_staff" ADD CONSTRAINT "FK_c7564c2f516783305c40b5a3135" FOREIGN KEY ("user_id") REFERENCES "app_user"("user_id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "facility_staff" ADD CONSTRAINT "FK_cb1ae89e523b669e3edd7e6c2ec" FOREIGN KEY ("facility_id") REFERENCES "facility"("facility_id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "facility_staff" DROP CONSTRAINT "FK_cb1ae89e523b669e3edd7e6c2ec"`);
        await queryRunner.query(`ALTER TABLE "facility_staff" DROP CONSTRAINT "FK_c7564c2f516783305c40b5a3135"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_facility_staff_user_facility"`);
        await queryRunner.query(`DROP TABLE "facility_staff"`);
    }

}
