import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';

import { Achievement } from 'src/achievements/entities/achievement.entity';
import { ApiKey } from 'src/api_keys/entities/api_key.entity';
import { Player } from 'src/players/entities/player.entity';
import { UserAdmin } from 'src/user-admin/entities/user-admin.entity';

@Entity('game')
@Index('idx_game_created_by', ['createdBy'])
@Index('uq_game_short_code', ['shortCode'], { unique: true })
export class Game {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ nullable: false })
	name: string;

	@Column({ name: 'short_code', nullable: false, unique: true })
	shortCode: string;

	@Column({ name: 'created_by', type: 'uuid', nullable: false })
	createdById: string;

	@ManyToOne(() => UserAdmin, (admin) => admin.games, {
		onDelete: 'CASCADE',
		eager: false,
	})
	@JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
	createdBy: string;

	@CreateDateColumn({
		name: 'created_at',
		type: 'timestamptz',
		default: () => 'now()',
	})
	createdAt: Date;

	@OneToMany(() => ApiKey, (key) => key.game, {
		cascade: false,
		eager: false,
	})
	apiKeys: ApiKey[];

	@OneToMany(() => Player, (player) => player.game, {
		cascade: false,
		eager: false,
	})
	players: Player[];

	@OneToMany(() => Achievement, (achievement) => achievement.game, {
		cascade: false,
		eager: false,
	})
	achievement: Achievement[];
}
