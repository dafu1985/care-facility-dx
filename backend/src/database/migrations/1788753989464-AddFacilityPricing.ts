import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFacilityPricing1788753989464 implements MigrationInterface {
    name = 'AddFacilityPricing1788753989464'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "facility_pricing" ("pricing_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "facility_id" uuid NOT NULL, "monthly_cost_min" integer NOT NULL, "monthly_cost_max" integer NOT NULL, "entrance_fee" integer NOT NULL, "note" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_df357b76c6beebd895a06ed84c" UNIQUE ("facility_id"), CONSTRAINT "PK_f26962ad946581a5ee4c1bde4eb" PRIMARY KEY ("pricing_id"))`);
        await queryRunner.query(`ALTER TABLE "facility_pricing" ADD CONSTRAINT "FK_df357b76c6beebd895a06ed84c0" FOREIGN KEY ("facility_id") REFERENCES "facility"("facility_id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "facility_pricing" DROP CONSTRAINT "FK_df357b76c6beebd895a06ed84c0"`);
        await queryRunner.query(`DROP TABLE "facility_pricing"`);
    }

}
