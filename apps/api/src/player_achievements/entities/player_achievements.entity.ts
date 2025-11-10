import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import { Achievement } from 'src/achievements/entities/achievements.entity';
import { Player } from 'src/players/entities/players.entity';

@Entity({ name: 'player_achievements' })
@Index('uq_player_achievement_id', ['achievement', 'player'], { unique: true }) // one unlock per player per achievement.
@Index('idx_player_achievement_from_player', ['player']) // list a player’s unlocked achievements.
@Index('idx_player_achievement_list_achievement', ['achievement']) // list who unlocked a specific achievement.
@Index('idx_player_achievement_player_recent', ['player', 'unlockedAt']) // recent unlocks per player.
@Index('idx_player_achievement_achieved_recent', ['achievement', 'unlockedAt']) // recent unlock stream per achievement (for rarity/feeds).
export class PlayerAchievement {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Achievement, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'achievement_id', referencedColumnName: 'id' })
	achievement: Achievement;

	@Column({ name: 'achievement_id', type: 'uuid', nullable: false })
	achievementId: string;

	@ManyToOne(() => Player, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'player_id', referencedColumnName: 'id' })
	player: Player;

	@Column({ name: 'player_id', type: 'uuid', nullable: false })
	playerId: string;

	@Column({
		name: 'metadata',
		type: 'jsonb',
		nullable: true,
		default: () => "'{}'",
	})
	metadata?: Record<string, any>;

	@Column({
		name: 'unlocked_at',
		type: 'timestamptz',
		default: () => 'now()',
	})
	unlockedAt: Date;
}
