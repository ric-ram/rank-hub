import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import { UserAdmin } from 'src/users-admin/entities/users-admin.entity';

@Entity({ name: 'refresh_tokens' })
@Index('idx_refresh_user_active', ['adminId', 'revokedAt'])
@Index('uq_refresh_user_fp_active', ['adminId', 'fingerprint'], {
	unique: true,
	where: `"revoked_at" = null`,
})
export class RefreshTokens {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'admin_id', type: 'uuid', nullable: false })
	adminId: string;

	@ManyToOne(() => UserAdmin, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'admin_id', referencedColumnName: 'id' })
	admin: UserAdmin;

	@Column({ name: 'token_hash', nullable: false })
	tokenHash: string;

	@Column({ name: 'fingerprint', nullable: false })
	fingerprint: string;

	@Column({ name: 'expires_at', type: 'timestamptz', nullable: false })
	@Index('idx_refresh_expires_at')
	expiresAt: Date;

	@Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
	revokedAt: Date;

	@CreateDateColumn({
		name: 'created_at',
		type: 'timestamptz',
		default: () => 'now()',
	})
	createdAt: Date;
}
