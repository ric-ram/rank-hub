import { PartialType } from '@nestjs/mapped-types';
import { CreatePlayerAchievementDto } from './create-player_achievement.dto';

export class UpdatePlayerAchievementDto extends PartialType(CreatePlayerAchievementDto) {}
