import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInquiryAndInquiryMessage1788761036098 implements MigrationInterface {
    name = 'AddInquiryAndInquiryMessage1788761036098'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "inquiry" ("inquiry_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "facility_id" uuid NOT NULL, "created_by_user_id" uuid NOT NULL, "subject" character varying(255) NOT NULL, "status" character varying(30) NOT NULL DEFAULT 'OPEN', "last_message_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1aa6f4901dfbf47ebd61ffa8644" PRIMARY KEY ("inquiry_id"))`);
        await queryRunner.query(`CREATE TABLE "inquiry_message" ("message_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "inquiry_id" uuid NOT NULL, "sender_user_id" uuid, "type" character varying(30) NOT NULL DEFAULT 'MESSAGE', "body" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e3729f44c3f6a625338b792231e" PRIMARY KEY ("message_id"))`);
        await queryRunner.query(`ALTER TABLE "inquiry" ADD CONSTRAINT "FK_89183c9b198524cfd358f9e5f4f" FOREIGN KEY ("facility_id") REFERENCES "facility"("facility_id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inquiry" ADD CONSTRAINT "FK_1d61f330583b1a480c6b9578005" FOREIGN KEY ("created_by_user_id") REFERENCES "app_user"("user_id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inquiry_message" ADD CONSTRAINT "FK_1790d452bec7f7e97c1b470cd8e" FOREIGN KEY ("inquiry_id") REFERENCES "inquiry"("inquiry_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inquiry_message" ADD CONSTRAINT "FK_d726937ee83825b737b6c2028f5" FOREIGN KEY ("sender_user_id") REFERENCES "app_user"("user_id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inquiry_message" DROP CONSTRAINT "FK_d726937ee83825b737b6c2028f5"`);
        await queryRunner.query(`ALTER TABLE "inquiry_message" DROP CONSTRAINT "FK_1790d452bec7f7e97c1b470cd8e"`);
        await queryRunner.query(`ALTER TABLE "inquiry" DROP CONSTRAINT "FK_1d61f330583b1a480c6b9578005"`);
        await queryRunner.query(`ALTER TABLE "inquiry" DROP CONSTRAINT "FK_89183c9b198524cfd358f9e5f4f"`);
        await queryRunner.query(`DROP TABLE "inquiry_message"`);
        await queryRunner.query(`DROP TABLE "inquiry"`);
    }

}
