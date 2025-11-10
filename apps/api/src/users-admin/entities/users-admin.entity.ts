import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';

import { Games } from 'src/games/entities/games.entity';
import { RefreshTokens } from 'src/auth/entities/refresh-tokens.entity';

@Entity({ name: 'users_admin' })
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
		default: () => 'now()',
	})
	createdAt: Date;

	@OneToMany(() => Games, (game) => game.createdBy, {
		cascade: false,
	})
	games: Games[];

	@OneToMany(() => RefreshTokens, (refreshToken) => refreshToken.adminId, {
		cascade: false,
	})
	refreshTokens: RefreshTokens[];
}
