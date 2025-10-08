import { MigrationInterface, QueryRunner } from 'typeorm';

export class TestMigration11759953819311 implements MigrationInterface {
	name = 'TestMigration11759953819311';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "user_admin" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'ADMIN', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_817b0a7067f6af076d1bf65ca1d" UNIQUE ("email"), CONSTRAINT "PK_c143511e72fac735b8006051e55" PRIMARY KEY ("id"))`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "user_admin"`);
	}
}
