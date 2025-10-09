import { Test, TestingModule } from '@nestjs/testing';
import { LeaderboardEntryService } from './leaderboard_entry.service';

describe('LeaderboardEntryService', () => {
  let service: LeaderboardEntryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeaderboardEntryService],
    }).compile();

    service = module.get<LeaderboardEntryService>(LeaderboardEntryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
