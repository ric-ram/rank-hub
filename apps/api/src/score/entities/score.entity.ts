import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	RelationId,
} from 'typeorm';

import { Leaderboard } from 'src/leaderboard/entities/leaderboard.entity';
import { Player } from 'src/player/entities/player.entity';

@Entity({ name: 'score' })
@Index('idx_score_desc', ['leaderboardId', 'value']) // fast Top-N when higher is better.
@Index('idx_score_asc', ['leaderboardId', 'value']) // fast Top-N when lower is better (time trials).
@Index('idx_score_submitted_desc', ['leaderboardId', 'submittedAt']) // recent submissions feed / moderation.
@Index('idx_score_player_timeline_desc', ['playerId', 'submittedAt']) // player activity timeline.
@Index('idx_score_player_leaderboard', ['playerId', 'leaderboardId']) // quick per-player lookups within a board.
export class Score {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Leaderboard, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'leaderboard_id', referencedColumnName: 'id' })
	leaderboard: Leaderboard;

	@RelationId((score: Score) => score.leaderboard)
	leaderboardId: string;

	@ManyToOne(() => Player, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'player_id', referencedColumnName: 'id' })
	player: Player;

	@RelationId((score: Score) => score.player)
	playerId: string;

	@Column({ name: 'value', type: 'numeric', precision: 20, scale: 6 })
	value: string;

	@Column({
		name: 'metadata',
		type: 'jsonb',
		nullable: true,
		default: () => "'{}'",
	})
	metadata?: Record<string, any>;

	@Column({
		name: 'submitted_at',
		type: 'timestamptz',
		default: () => 'now()',
	})
	submittedAt: Date;
}
