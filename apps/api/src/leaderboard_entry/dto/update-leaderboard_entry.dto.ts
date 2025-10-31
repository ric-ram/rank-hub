import { CreateLeaderboardEntryDto } from './create-leaderboard_entry.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateLeaderboardEntryDto extends PartialType(
	CreateLeaderboardEntryDto,
) {}
