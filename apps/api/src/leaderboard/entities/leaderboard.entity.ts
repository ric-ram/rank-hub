import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	RelationId,
} from 'typeorm';

import { Game } from 'src/game/entities/game.entity';

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
}
