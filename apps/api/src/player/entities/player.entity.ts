import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	RelationId,
} from 'typeorm';

import { Game } from 'src/game/entities/game.entity';
import { LeaderboardEntry } from 'src/leaderboard_entry/entities/leaderboard_entry.entity';
import { Score } from 'src/score/entities/score.entity';

@Entity({ name: 'player' })
@Index('uq_player_game_user', ['game', 'username'], { unique: true })
export class Player {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@RelationId((player: Player) => player.game)
	gameId: string;

	@ManyToOne(() => Game, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'game_id', referencedColumnName: 'id' })
	game: Game;

	@Column({ name: 'username', type: 'text', nullable: false })
	username: string;

	@Column({ name: 'email', type: 'text', nullable: true })
	email?: string;

	@Column({
		name: 'metadata',
		type: 'jsonb',
		nullable: true,
		default: () => "'{}'",
	})
	metadata?: Record<string, any>;

	@Column({
		name: 'created_at',
		type: 'timestamptz',
		default: 'now()',
	})
	createdAt: Date;

	@OneToMany(() => Score, (score) => score.player, {
		cascade: false,
		eager: false,
	})
	scores: Score[];

	@OneToMany(() => LeaderboardEntry, (e) => e.player)
	leaderboardEntries: LeaderboardEntry[];
}
