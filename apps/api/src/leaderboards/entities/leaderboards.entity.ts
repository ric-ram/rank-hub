import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';

import { Games } from 'src/games/entities/games.entity';
import { LeaderboardEntry } from 'src/leaderboard_entries/entities/leaderboard_entries.entity';
import { Score } from 'src/scores/entities/scores.entity';

@Entity({ name: 'leaderboards' })
export class Leaderboard {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'game_id', type: 'uuid', nullable: false })
	gameId: string;

	@ManyToOne(() => Games, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'game_id', referencedColumnName: 'id' })
	game: Games;

	@Column({ name: 'name', type: 'text', nullable: false })
	name: string;

	@Column({ name: 'metric_type', type: 'text', nullable: false })
	metricType: string;

	@Column({ name: 'order_dir', type: 'text', nullable: false })
	orderDir: string;

	@Column({
		name: 'is_default',
		type: 'boolean',
		nullable: true,
		default: true,
	})
	isDefault: boolean;

	@Column({
		name: 'created_at',
		type: 'timestamptz',
		default: 'now()',
	})
	createdAt: Date;

	@OneToMany(() => Score, (score) => score.leaderboard, {
		cascade: false,
		eager: false,
	})
	scores: Score[];

	@OneToMany(() => LeaderboardEntry, (e) => e.leaderboard)
	entries: LeaderboardEntry[];
}
