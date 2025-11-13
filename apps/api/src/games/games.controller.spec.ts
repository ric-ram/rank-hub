import { Test, TestingModule } from '@nestjs/testing';

import { GameController } from './games.controller';
import { GamesService } from './games.service';

describe('GameController', () => {
	let controller: GameController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [GameController],
			providers: [GamesService],
		}).compile();

		controller = module.get<GameController>(GameController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
