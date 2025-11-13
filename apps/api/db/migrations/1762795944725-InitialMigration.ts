import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1762795944725 implements MigrationInterface {
    name = 'InitialMigration1762795944725'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leaderboards" ALTER COLUMN "created_at" SET DEFAULT 'now()'`);
        await queryRunner.query(`ALTER TABLE "players" ALTER COLUMN "created_at" SET DEFAULT 'now()'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "players" ALTER COLUMN "created_at" SET DEFAULT '2025-11-10 17:32:12.101917+00'`);
        await queryRunner.query(`ALTER TABLE "leaderboards" ALTER COLUMN "created_at" SET DEFAULT '2025-11-10 17:32:12.101917+00'`);
    }

}
