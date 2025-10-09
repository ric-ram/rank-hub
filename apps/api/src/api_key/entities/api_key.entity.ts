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

@Entity({ name: 'api_key' })
@Index('idx_api_key_game_active', ['gameId', 'isActive'])
@Index('uq_api_key_game_hash', ['gameId', 'keyHash'], { unique: true })
export class ApiKey {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@RelationId((apiKey: ApiKey) => apiKey.game)
	gameId: string;

	@ManyToOne(() => Game, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'game_id', referencedColumnName: 'id' })
	game: Game;

	@Column({ name: 'key_hash', type: 'text', nullable: false })
	keyHash: string;

	@Column({ name: 'label', type: 'text', nullable: true })
	label?: string;

	@Column({ name: 'isActive', type: 'boolean', default: true })
	is_active: boolean;

	@Column({
		name: 'created_at',
		type: 'timestamptz',
		default: () => 'CURRENT_TIMESTAMP',
	})
	createdAt: Date;

	@Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
	revokedAt?: Date;
}
