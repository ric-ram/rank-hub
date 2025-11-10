import { Test, TestingModule } from '@nestjs/testing';

import { PlayerAchievementController } from './player_achievements.controller';
import { PlayerAchievementService } from './player_achievements.service';

describe('PlayerAchievementController', () => {
	let controller: PlayerAchievementController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [PlayerAchievementController],
			providers: [PlayerAchievementService],
		}).compile();

		controller = module.get<PlayerAchievementController>(
			PlayerAchievementController,
		);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
