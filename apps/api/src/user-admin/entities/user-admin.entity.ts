import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'user_admin' })
export class UserAdmin {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ nullable: false, unique: true })
	email: string;

	@Column({ nullable: false })
	passwordHash: string;

	@Column({
		default: 'ADMIN',
	})
	role: string;

	@CreateDateColumn({
		type: 'timestamptz',
		default: () => 'CURRENT_TIMESTAMP',
	})
	createdAt: Date;
}
