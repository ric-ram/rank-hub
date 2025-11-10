import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { CreateLeaderboardEntryDto } from './dto/create-leaderboard_entry.dto';
import { UpdateLeaderboardEntryDto } from './dto/update-leaderboard_entry.dto';
import { LeaderboardEntryService } from './leaderboard_entries.service';

@Controller('leaderboard-entry')
export class LeaderboardEntryController {
	constructor(
		private readonly leaderboardEntryService: LeaderboardEntryService,
	) {}

	@Post()
	create(@Body() createLeaderboardEntryDto: CreateLeaderboardEntryDto) {
		return this.leaderboardEntryService.create(createLeaderboardEntryDto);
	}

	@Get()
	findAll() {
		return this.leaderboardEntryService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.leaderboardEntryService.findOne(+id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateLeaderboardEntryDto: UpdateLeaderboardEntryDto,
	) {
		return this.leaderboardEntryService.update(
			+id,
			updateLeaderboardEntryDto,
		);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.leaderboardEntryService.remove(+id);
	}
}
