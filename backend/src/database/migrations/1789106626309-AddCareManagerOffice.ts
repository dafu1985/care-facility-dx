import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCareManagerOffice1789106626309 implements MigrationInterface {
    name = 'AddCareManagerOffice1789106626309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "care_manager_office" ("care_manager_office_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid, "name" character varying(255) NOT NULL, "office_number" character varying(100), "status" character varying(30) NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_46bba56cd966d81cd8c7925ff6f" PRIMARY KEY ("care_manager_office_id"))`);
        await queryRunner.query(`CREATE INDEX "idx_care_manager_office_organization_id" ON "care_manager_office" ("organization_id") `);
        await queryRunner.query(`CREATE INDEX "idx_care_manager_office_name" ON "care_manager_office" ("name") `);
        await queryRunner.query(`ALTER TABLE "care_manager_office" ADD CONSTRAINT "FK_25fb7dbbdcbbae5df3206316c50" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "care_manager_office" DROP CONSTRAINT "FK_25fb7dbbdcbbae5df3206316c50"`);
        await queryRunner.query(`DROP INDEX "public"."idx_care_manager_office_name"`);
        await queryRunner.query(`DROP INDEX "public"."idx_care_manager_office_organization_id"`);
        await queryRunner.query(`DROP TABLE "care_manager_office"`);
    }

}
