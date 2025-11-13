import { Test, TestingModule } from '@nestjs/testing';

import { ScoreController } from './scores.controller';
import { ScoreService } from './scores.service';

describe('ScoreController', () => {
	let controller: ScoreController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ScoreController],
			providers: [ScoreService],
		}).compile();

		controller = module.get<ScoreController>(ScoreController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
