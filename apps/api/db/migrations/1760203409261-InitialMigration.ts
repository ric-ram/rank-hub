import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1760203409261 implements MigrationInterface {
	name = 'InitialMigration1760203409261';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "score" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "leaderboard_id" uuid NOT NULL, "player_id" uuid NOT NULL, "value" numeric(20,6) NOT NULL, "metadata" jsonb DEFAULT '{}', "submitted_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1770f42c61451103f5514134078" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE INDEX "idx_score_player_leaderboard" ON "score" ("player_id", "leaderboard_id") `,
		);
		await queryRunner.query(
			`CREATE INDEX "idx_score_player_timeline_desc" ON "score" ("player_id", "submitted_at"  DESC) `,
		);
		await queryRunner.query(
			`CREATE INDEX "idx_score_submitted_desc" ON "score" ("leaderboard_id", "submitted_at" DESC) `,
		);
		await queryRunner.query(
			`CREATE INDEX "idx_score_asc" ON "score" ("leaderboard_id", "value" ASC) `,
		);
		await queryRunner.query(
			`CREATE INDEX "idx_score_desc" ON "score" ("leaderboard_id", "value" DESC) `,
		);
		await queryRunner.query(
			`CREATE TABLE "leaderboard" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "game_id" uuid NOT NULL, "name" text NOT NULL, "metric_type" text NOT NULL, "order_dir" text NOT NULL, "is_default" boolean DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_76fd1d52cf44d209920f73f4608" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "leaderboard_entry" ("leaderboard_id" uuid NOT NULL, "player_id" uuid NOT NULL, "best_value" numeric(20,6) NOT NULL, "best_score_id" uuid NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "rank" integer, CONSTRAINT "REL_72228ca5b05cdb511458945ae8" UNIQUE ("best_score_id"), CONSTRAINT "PK_8959e6724c1c660753d4f1ab059" PRIMARY KEY ("leaderboard_id", "player_id"))`,
		);
		await queryRunner.query(
			`CREATE INDEX "idx_leaderboard_entry_most_recent" ON "leaderboard_entry" ("leaderboard_id", "updated_at" DESC) `,
		);
		await queryRunner.query(
			`CREATE INDEX "idx_leaderboard_entry_player" ON "leaderboard_entry" ("player_id") `,
		);
		await queryRunner.query(
			`CREATE INDEX "idx_leaderboard_entry_value_asc" ON "leaderboard_entry" ("leaderboard_id", "best_value" ASC) `,
		);
		await queryRunner.query(
			`CREATE INDEX "idx_leaderboard_entry_value_desc" ON "leaderboard_entry" ("leaderboard_id", "best_value" DESC) `,
		);
		await queryRunner.query(
			`CREATE TABLE "player" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "game_id" uuid NOT NULL, "username" text NOT NULL, "email" text, "metadata" jsonb DEFAULT '{}', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX "uq_player_game_user" ON "player" ("game_id", "username") `,
		);
		await queryRunner.query(
			`CREATE TABLE "player_achievement" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "achievement_id" uuid NOT NULL, "player_id" uuid NOT NULL, "metadata" jsonb DEFAULT '{}', "unlocked_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f93710f14a4199121357e149952" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE INDEX "idx_player_achievement_achieved_recent" ON "player_achievement" ("achievement_id", "unlocked_at" DESC) `,
		);
		await queryRunner.query(
			`CREATE INDEX "idx_player_achievement_player_recent" ON "player_achievement" ("player_id", "unlocked_at" DESC) `,
		);
		await queryRunner.query(
			`CREATE INDEX "idx_player_achievement_list_achievement" ON "player_achievement" ("achievement_id") `,
		);
		await queryRunner.query(
			`CREATE INDEX "idx_player_achievement_from_player" ON "player_achievement" ("player_id") `,
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX "uq_player_achievement_id" ON "player_achievement" ("achievement_id", "player_id") `,
		);
		await queryRunner.query(
			`CREATE TABLE "achievement" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "game_id" uuid NOT NULL, "key" text NOT NULL, "title" text NOT NULL, "description" text NOT NULL, "metadata" jsonb DEFAULT '{}', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_441339f40e8ce717525a381671e" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE INDEX "idx_game_achievements" ON "achievement" ("game_id") `,
		);
		await queryRunner.query(
			`CREATE INDEX "idx_achievement_key_by_game" ON "achievement" ("game_id", "key") `,
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX "uq_achievement_id" ON "achievement" ("game_id", "key") `,
		);
		await queryRunner.query(
			`CREATE TABLE "api_key" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "game_id" uuid NOT NULL, "key_hash" text NOT NULL, "label" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "revoked_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_b1bd840641b8acbaad89c3d8d11" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX "uq_api_key_game_hash" ON "api_key" ("game_id", "key_hash") `,
		);
		await queryRunner.query(
			`CREATE INDEX "idx_api_key_game_active" ON "api_key" ("game_id") WHERE "is_active" = true`,
		);
		await queryRunner.query(
			`CREATE TABLE "game" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "short_code" character varying NOT NULL, "created_by" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_425f5b4de81eefd831cde17ec44" UNIQUE ("short_code"), CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX "uq_game_short_code" ON "game" ("short_code") `,
		);
		await queryRunner.query(
			`CREATE INDEX "idx_game_created_by" ON "game" ("created_by") `,
		);
		await queryRunner.query(
			`CREATE TABLE "user_admin" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'ADMIN', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_817b0a7067f6af076d1bf65ca1d" UNIQUE ("email"), CONSTRAINT "PK_c143511e72fac735b8006051e55" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`ALTER TABLE "score" ADD CONSTRAINT "FK_270ba4a69102f288aa81cbbe585" FOREIGN KEY ("leaderboard_id") REFERENCES "leaderboard"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "score" ADD CONSTRAINT "FK_b3cfd86ca34c6118628491c5b16" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "leaderboard" ADD CONSTRAINT "FK_19c4ed157800595ea0a0ae83f33" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "leaderboard_entry" ADD CONSTRAINT "FK_cf3d7cfe2b213f647d4aaa2547b" FOREIGN KEY ("leaderboard_id") REFERENCES "leaderboard"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "leaderboard_entry" ADD CONSTRAINT "FK_52e15526e2e9edaf0bfb4702c6a" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "leaderboard_entry" ADD CONSTRAINT "FK_72228ca5b05cdb511458945ae8f" FOREIGN KEY ("best_score_id") REFERENCES "score"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "player" ADD CONSTRAINT "FK_433f544c592c2b6cbdfd2edbec3" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "player_achievement" ADD CONSTRAINT "FK_57d7308a68021fcbf870508e5f5" FOREIGN KEY ("achievement_id") REFERENCES "achievement"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "player_achievement" ADD CONSTRAINT "FK_875d5d6f99a388fd11cc36e9299" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "achievement" ADD CONSTRAINT "FK_a962999f55363a0d9c5ea83cc95" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "api_key" ADD CONSTRAINT "FK_c706daca7acb1a182d6bedab499" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "game" ADD CONSTRAINT "FK_2b8d5f66e3fc93a94e83fadc017" FOREIGN KEY ("created_by") REFERENCES "user_admin"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "game" DROP CONSTRAINT "FK_2b8d5f66e3fc93a94e83fadc017"`,
		);
		await queryRunner.query(
			`ALTER TABLE "api_key" DROP CONSTRAINT "FK_c706daca7acb1a182d6bedab499"`,
		);
		await queryRunner.query(
			`ALTER TABLE "achievement" DROP CONSTRAINT "FK_a962999f55363a0d9c5ea83cc95"`,
		);
		await queryRunner.query(
			`ALTER TABLE "player_achievement" DROP CONSTRAINT "FK_875d5d6f99a388fd11cc36e9299"`,
		);
		await queryRunner.query(
			`ALTER TABLE "player_achievement" DROP CONSTRAINT "FK_57d7308a68021fcbf870508e5f5"`,
		);
		await queryRunner.query(
			`ALTER TABLE "player" DROP CONSTRAINT "FK_433f544c592c2b6cbdfd2edbec3"`,
		);
		await queryRunner.query(
			`ALTER TABLE "leaderboard_entry" DROP CONSTRAINT "FK_72228ca5b05cdb511458945ae8f"`,
		);
		await queryRunner.query(
			`ALTER TABLE "leaderboard_entry" DROP CONSTRAINT "FK_52e15526e2e9edaf0bfb4702c6a"`,
		);
		await queryRunner.query(
			`ALTER TABLE "leaderboard_entry" DROP CONSTRAINT "FK_cf3d7cfe2b213f647d4aaa2547b"`,
		);
		await queryRunner.query(
			`ALTER TABLE "leaderboard" DROP CONSTRAINT "FK_19c4ed157800595ea0a0ae83f33"`,
		);
		await queryRunner.query(
			`ALTER TABLE "score" DROP CONSTRAINT "FK_b3cfd86ca34c6118628491c5b16"`,
		);
		await queryRunner.query(
			`ALTER TABLE "score" DROP CONSTRAINT "FK_270ba4a69102f288aa81cbbe585"`,
		);
		await queryRunner.query(`DROP TABLE "user_admin"`);
		await queryRunner.query(`DROP INDEX "public"."idx_game_created_by"`);
		await queryRunner.query(`DROP INDEX "public"."uq_game_short_code"`);
		await queryRunner.query(`DROP TABLE "game"`);
		await queryRunner.query(
			`DROP INDEX "public"."idx_api_key_game_active"`,
		);
		await queryRunner.query(`DROP INDEX "public"."uq_api_key_game_hash"`);
		await queryRunner.query(`DROP TABLE "api_key"`);
		await queryRunner.query(`DROP INDEX "public"."uq_achievement_id"`);
		await queryRunner.query(
			`DROP INDEX "public"."idx_achievement_key_by_game"`,
		);
		await queryRunner.query(`DROP INDEX "public"."idx_game_achievements"`);
		await queryRunner.query(`DROP TABLE "achievement"`);
		await queryRunner.query(
			`DROP INDEX "public"."uq_player_achievement_id"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."idx_player_achievement_from_player"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."idx_player_achievement_list_achievement"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."idx_player_achievement_player_recent"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."idx_player_achievement_achieved_recent"`,
		);
		await queryRunner.query(`DROP TABLE "player_achievement"`);
		await queryRunner.query(`DROP INDEX "public"."uq_player_game_user"`);
		await queryRunner.query(`DROP TABLE "player"`);
		await queryRunner.query(
			`DROP INDEX "public"."idx_leaderboard_entry_value_desc"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."idx_leaderboard_entry_value_asc"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."idx_leaderboard_entry_player"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."idx_leaderboard_entry_most_recent"`,
		);
		await queryRunner.query(`DROP TABLE "leaderboard_entry"`);
		await queryRunner.query(`DROP TABLE "leaderboard"`);
		await queryRunner.query(`DROP INDEX "public"."idx_score_desc"`);
		await queryRunner.query(`DROP INDEX "public"."idx_score_asc"`);
		await queryRunner.query(
			`DROP INDEX "public"."idx_score_submitted_desc"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."idx_score_player_timeline_desc"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."idx_score_player_leaderboard"`,
		);
		await queryRunner.query(`DROP TABLE "score"`);
	}
}
