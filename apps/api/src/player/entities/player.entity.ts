import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	RelationId,
} from 'typeorm';

import { Game } from 'src/game/entities/game.entity';

@Entity({ name: 'player' })
@Index('uq_player_game_user', ['gameId', 'username'], { unique: true })
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
		default: 'CURRENT_TIMESTAMP',
	})
	createdAt: Date;
}
