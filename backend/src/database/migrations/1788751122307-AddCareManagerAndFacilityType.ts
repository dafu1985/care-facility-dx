import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1788751122307 implements MigrationInterface {
    name = 'AddCareManagerAndFacilityType1788751122307';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "care_manager" ("user_id" uuid NOT NULL, "organization_name" character varying(255) NOT NULL, "license_number" character varying(100), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a7c3ca8d7df37e8341048f8b123" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "facility_type" ("facility_type_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_903841da08f30fad8c084a3fe5c" UNIQUE ("name"), CONSTRAINT "PK_935bf9f110b22cbabf71d38f7ec" PRIMARY KEY ("facility_type_id"))`);
        await queryRunner.query(`ALTER TABLE "care_manager" ADD CONSTRAINT "FK_a7c3ca8d7df37e8341048f8b123" FOREIGN KEY ("user_id") REFERENCES "app_user"("user_id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "care_manager" DROP CONSTRAINT "FK_a7c3ca8d7df37e8341048f8b123"`);
        await queryRunner.query(`DROP TABLE "facility_type"`);
        await queryRunner.query(`DROP TABLE "care_manager"`);
    }

}
