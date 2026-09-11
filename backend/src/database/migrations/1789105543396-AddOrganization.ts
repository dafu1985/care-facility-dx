import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganization1789105543396 implements MigrationInterface {
  name = 'AddOrganization1789105543396';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "organization" ("organization_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "organization_type" character varying(50), "status" character varying(30) NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ed1251fa3856cd1a6c98d7bcaa3" PRIMARY KEY ("organization_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_organization_name" ON "organization" ("name") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_organization_name"`);
    await queryRunner.query(`DROP TABLE "organization"`);
  }
}
