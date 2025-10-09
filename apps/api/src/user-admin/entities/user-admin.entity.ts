import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';

import { Game } from 'src/game/entities/game.entity';

@Entity({ name: 'user_admin' })
export class UserAdmin {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'email', nullable: false, unique: true })
	email: string;

	@Column({ name: 'password_hash', nullable: false })
	passwordHash: string;

	@Column({
		name: 'role',
		default: 'ADMIN',
	})
	role: string;

	@CreateDateColumn({
		name: 'created_at',
		type: 'timestamptz',
		default: () => 'CURRENT_TIMESTAMP',
	})
	createdAt: Date;

	@OneToMany(() => Game, (game) => game.createdBy, {
		cascade: false,
	})
	games: Game[];
}
