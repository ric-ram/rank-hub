import { Test, TestingModule } from '@nestjs/testing';

import { LeaderboardController } from './leaderboards.controller';
import { LeaderboardService } from './leaderboards.service';

describe('LeaderboardController', () => {
	let controller: LeaderboardController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [LeaderboardController],
			providers: [LeaderboardService],
		}).compile();

		controller = module.get<LeaderboardController>(LeaderboardController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
