import { MigrationInterface, QueryRunner } from "typeorm";

export class LinkInquiryToPlacementCase1789111624224 implements MigrationInterface {
    name = 'LinkInquiryToPlacementCase1789111624224'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inquiry" ADD "placement_case_id" uuid`);
        await queryRunner.query(`ALTER TABLE "inquiry" ADD "candidate_facility_id" uuid`);
        await queryRunner.query(`CREATE INDEX "idx_inquiry_candidate_facility_id" ON "inquiry" ("candidate_facility_id") `);
        await queryRunner.query(`CREATE INDEX "idx_inquiry_placement_case_id" ON "inquiry" ("placement_case_id") `);
        await queryRunner.query(`ALTER TABLE "inquiry" ADD CONSTRAINT "FK_9864e7876d95952aa933c758cb2" FOREIGN KEY ("placement_case_id") REFERENCES "placement_case"("placement_case_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inquiry" ADD CONSTRAINT "FK_6aebdb5977c894dea0146a0764e" FOREIGN KEY ("candidate_facility_id") REFERENCES "candidate_facility"("candidate_facility_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inquiry" DROP CONSTRAINT "FK_6aebdb5977c894dea0146a0764e"`);
        await queryRunner.query(`ALTER TABLE "inquiry" DROP CONSTRAINT "FK_9864e7876d95952aa933c758cb2"`);
        await queryRunner.query(`DROP INDEX "public"."idx_inquiry_placement_case_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_inquiry_candidate_facility_id"`);
        await queryRunner.query(`ALTER TABLE "inquiry" DROP COLUMN "candidate_facility_id"`);
        await queryRunner.query(`ALTER TABLE "inquiry" DROP COLUMN "placement_case_id"`);
    }

}
