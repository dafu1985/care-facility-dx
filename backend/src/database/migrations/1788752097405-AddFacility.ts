import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFacility1788752097405 implements MigrationInterface {
    name = 'AddFacility1788752097405'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "facility" ("facility_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "facility_type_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "postal_code" character varying(20), "address" character varying(500), "area" character varying(100) NOT NULL, "phone" character varying(30), "description" text, "status" character varying(30) NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3c7d400e55116f7417ac50dbe04" PRIMARY KEY ("facility_id"))`);
        await queryRunner.query(`ALTER TABLE "facility" ADD CONSTRAINT "FK_4b018ded9a9c271b1b21ca35dda" FOREIGN KEY ("facility_type_id") REFERENCES "facility_type"("facility_type_id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "facility" DROP CONSTRAINT "FK_4b018ded9a9c271b1b21ca35dda"`);
        await queryRunner.query(`DROP TABLE "facility"`);
    }

}
