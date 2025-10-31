import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';

import { Game } from 'src/game/entities/game.entity';
import { PlayerAchievement } from 'src/player_achievement/entities/player_achievement.entity';

@Entity({ name: 'achievement' })
@Index('uq_achievement_id', ['game', 'key'], { unique: true })
@Index('idx_achievement_key_by_game', ['game', 'key'])
@Index('idx_game_achievements', ['game'])
export class Achievement {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Game, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'game_id', referencedColumnName: 'id' })
	game: Game;

	@Column({ name: 'game_id', type: 'uuid', nullable: false })
	gameId: string;

	@Column({ name: 'key', type: 'text', nullable: false })
	key: string;

	@Column({ name: 'title', type: 'text', nullable: false })
	title: string;

	@Column({ name: 'description', type: 'text', nullable: false })
	description: string;

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
		default: () => 'now()',
	})
	createdAt: Date;

	@OneToMany(
		() => PlayerAchievement,
		(playerAchievement) => playerAchievement.achievement,
		{
			cascade: false,
			eager: false,
		},
	)
	playerAchievements: PlayerAchievement[];
}
