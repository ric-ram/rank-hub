import { Test, TestingModule } from '@nestjs/testing';

import { UserAdminService } from './users-admin.service';

describe('UserAdminService', () => {
	let service: UserAdminService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [UserAdminService],
		}).compile();

		service = module.get<UserAdminService>(UserAdminService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
