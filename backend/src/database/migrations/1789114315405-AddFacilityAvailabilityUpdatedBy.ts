import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFacilityAvailabilityUpdatedBy1789114315405 implements MigrationInterface {
  name = 'AddFacilityAvailabilityUpdatedBy1789114315405';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 空床情報を最後に更新したユーザーIDを追加する。
    await queryRunner.query(
      `ALTER TABLE "facility_availability" ADD "updated_by" uuid`,
    );

    // 更新ユーザーが削除された場合でも空床情報は残す。
    await queryRunner.query(
      `ALTER TABLE "facility_availability" ADD CONSTRAINT "FK_329c0827d39f560bf0396a4c2aa" FOREIGN KEY ("updated_by") REFERENCES "app_user"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facility_availability" DROP CONSTRAINT "FK_329c0827d39f560bf0396a4c2aa"`,
    );

    await queryRunner.query(
      `ALTER TABLE "facility_availability" DROP COLUMN "updated_by"`,
    );
  }
}
