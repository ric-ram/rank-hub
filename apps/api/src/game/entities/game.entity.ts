import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import { UserAdmin } from 'src/user-admin/entities/user-admin.entity';

@Entity('game')
@Index('idx_game_created_by', ['createdById'])
@Index('uq_game_short_code', ['shortCode'], { unique: true })
export class Game {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ nullable: false })
	name: string;

	@Column({ name: 'short_code', nullable: false, unique: true })
	shortCode: string;

	@Column({ name: 'created_by', type: 'uuid' })
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
		default: () => 'CURRENT_TIMESTAMP',
	})
	createdAt: Date;
}
