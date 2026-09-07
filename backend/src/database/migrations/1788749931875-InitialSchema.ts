import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1788749931875 implements MigrationInterface {
    name = 'InitialSchema1788749931875'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "app_user" ("user_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" character varying(30) NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying(255), "status" character varying(30) NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_3fa909d0e37c531ebc237703391" UNIQUE ("email"), CONSTRAINT "PK_c261da74fc0ff6d9437b9a26a8f" PRIMARY KEY ("user_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "app_user"`);
    }

}
