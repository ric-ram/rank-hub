import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import { Games } from 'src/games/entities/games.entity';

@Entity({ name: 'api_keys' })
@Index('idx_api_key_game_active', ['game'], { where: `"is_active" = true` })
@Index('uq_api_key_game_hash', ['game', 'keyHash'], { unique: true })
export class ApiKey {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'game_id', type: 'uuid', nullable: false })
	gameId: string;

	@ManyToOne(() => Games, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'game_id', referencedColumnName: 'id' })
	game: Games;

	@Column({ name: 'key_hash', type: 'text', nullable: false })
	keyHash: string;

	@Column({ name: 'label', type: 'text', nullable: true })
	label?: string;

	@Column({ name: 'is_active', type: 'boolean', default: true })
	is_active: boolean;

	@Column({
		name: 'created_at',
		type: 'timestamptz',
		default: () => 'now()',
	})
	createdAt: Date;

	@Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
	revokedAt?: Date;
}
