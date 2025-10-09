import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	OneToOne,
	PrimaryColumn,
	RelationId,
} from 'typeorm';

import { Leaderboard } from 'src/leaderboard/entities/leaderboard.entity';
import { Player } from 'src/player/entities/player.entity';
import { Score } from 'src/score/entities/score.entity';

@Entity({ name: 'leaderboard_entry' })
@Index('idx_leaderboard_entry_value_desc', ['leaderboard', 'bestValue']) // fast Top-N for DESC boards.
@Index('idx_leaderboard_entry_value_asc', ['leaderboard', 'bestValue']) // fast Top-N for ASC boards.
@Index('idx_leaderboard_entry_player', ['player']) // fetch a player’s standings across boards.
@Index('idx_leaderboard_entry_most_recent', ['leaderboard', 'updatedAt']) // recent changes (re-ranking, audits).
export class LeaderboardEntry {
	@PrimaryColumn({ name: 'leaderboard_id', type: 'uuid' })
	leaderboardId: string;

	@PrimaryColumn({ name: 'player_id', type: 'uuid' })
	playerId: string;

	@ManyToOne(() => Leaderboard, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'leaderboard_id', referencedColumnName: 'id' })
	leaderboard: Leaderboard;

	@ManyToOne(() => Player, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'player_id', referencedColumnName: 'id' })
	player: Player;

	@Column({ name: 'best_value', type: 'numeric', precision: 20, scale: 6 })
	bestValue: string;

	@OneToOne(() => Score, { onDelete: 'SET NULL' })
	@JoinColumn({ name: 'best_score_id' })
	bestScore: Score;

	@RelationId(
		(leaderboardEntry: LeaderboardEntry) => leaderboardEntry.bestScore,
	)
	bestScoreId: string;

	@Column({
		name: 'updated_at',
		type: 'timestamptz',
		default: () => 'now()',
	})
	updatedAt: Date;

	@Column({ type: 'int', nullable: true })
	rank?: number;
}
