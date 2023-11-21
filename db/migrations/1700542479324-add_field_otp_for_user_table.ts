import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldOtpForUserTable1700542479324 implements MigrationInterface {
    name = 'AddFieldOtpForUserTable1700542479324'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`otp\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`otp_expire_at\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`status\` \`status\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`status\` \`status\` int NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`otp_expire_at\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`otp\``);
    }

}
