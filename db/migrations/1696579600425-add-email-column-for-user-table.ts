import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailColumnForUserTable1696579600425 implements MigrationInterface {
    name = 'AddEmailColumnForUserTable1696579600425'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`email\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`email\``);
    }

}
