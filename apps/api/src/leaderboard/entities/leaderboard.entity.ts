import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	RelationId,
} from 'typeorm';

import { Game } from 'src/game/entities/game.entity';
import { LeaderboardEntry } from 'src/leaderboard_entry/entities/leaderboard_entry.entity';
import { Score } from 'src/score/entities/score.entity';

@Entity({ name: 'leaderboard' })
export class Leaderboard {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@RelationId((leaderboard: Leaderboard) => leaderboard.game)
	gameId: string;

	@ManyToOne(() => Game, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'game_id', referencedColumnName: 'id' })
	game: Game;

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
