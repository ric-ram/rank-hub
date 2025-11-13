import { Test, TestingModule } from '@nestjs/testing';

import { ApiKeyController } from './api_keys.controller';
import { ApiKeyService } from './api_keys.service';

describe('ApiKeyController', () => {
	let controller: ApiKeyController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ApiKeyController],
			providers: [ApiKeyService],
		}).compile();

		controller = module.get<ApiKeyController>(ApiKeyController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
