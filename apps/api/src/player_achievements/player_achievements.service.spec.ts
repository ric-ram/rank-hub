import { Test, TestingModule } from '@nestjs/testing';

import { PlayerAchievementService } from './player_achievements.service';

describe('PlayerAchievementService', () => {
	let service: PlayerAchievementService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PlayerAchievementService],
		}).compile();

		service = module.get<PlayerAchievementService>(
			PlayerAchievementService,
		);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
