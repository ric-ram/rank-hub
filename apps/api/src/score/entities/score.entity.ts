import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import { Leaderboard } from 'src/leaderboards/entities/leaderboard.entity';
import { Player } from 'src/players/entities/player.entity';

@Entity({ name: 'score' })
@Index('idx_score_desc', ['leaderboard', 'value']) // fast Top-N when higher is better.
@Index('idx_score_asc', ['leaderboard', 'value']) // fast Top-N when lower is better (time trials).
@Index('idx_score_submitted_desc', ['leaderboard', 'submittedAt']) // recent submissions feed / moderation.
@Index('idx_score_player_timeline_desc', ['player', 'submittedAt']) // player activity timeline.
@Index('idx_score_player_leaderboard', ['player', 'leaderboard']) // quick per-player lookups within a board.
export class Score {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Leaderboard, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'leaderboard_id', referencedColumnName: 'id' })
	leaderboard: Leaderboard;

	@Column({ name: 'leaderboard_id', type: 'uuid', nullable: false })
	leaderboardId: string;

	@ManyToOne(() => Player, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'player_id', referencedColumnName: 'id' })
	player: Player;

	@Column({ name: 'player_id', type: 'uuid', nullable: false })
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
