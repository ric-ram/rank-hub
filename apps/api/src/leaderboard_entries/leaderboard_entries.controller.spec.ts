import { Test, TestingModule } from '@nestjs/testing';

import { LeaderboardEntryController } from './leaderboard_entries.controller';
import { LeaderboardEntryService } from './leaderboard_entries.service';

describe('LeaderboardEntryController', () => {
	let controller: LeaderboardEntryController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [LeaderboardEntryController],
			providers: [LeaderboardEntryService],
		}).compile();

		controller = module.get<LeaderboardEntryController>(
			LeaderboardEntryController,
		);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
