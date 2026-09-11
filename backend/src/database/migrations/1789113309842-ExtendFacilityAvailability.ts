import { MigrationInterface, QueryRunner } from "typeorm";

export class ExtendFacilityAvailability1789113309842 implements MigrationInterface {
    name = 'ExtendFacilityAvailability1789113309842'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "facility_availability" ADD "male_vacancy" integer`);
        await queryRunner.query(`ALTER TABLE "facility_availability" ADD "female_vacancy" integer`);
        await queryRunner.query(`ALTER TABLE "facility_availability" ADD "private_room_vacancy" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "facility_availability" DROP COLUMN "private_room_vacancy"`);
        await queryRunner.query(`ALTER TABLE "facility_availability" DROP COLUMN "female_vacancy"`);
        await queryRunner.query(`ALTER TABLE "facility_availability" DROP COLUMN "male_vacancy"`);
    }

}
