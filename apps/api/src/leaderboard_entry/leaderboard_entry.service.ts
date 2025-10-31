import { Injectable } from '@nestjs/common';
import { CreateLeaderboardEntryDto } from './dto/create-leaderboard_entry.dto';
import { UpdateLeaderboardEntryDto } from './dto/update-leaderboard_entry.dto';

@Injectable()
export class LeaderboardEntryService {
  create(createLeaderboardEntryDto: CreateLeaderboardEntryDto) {
    return 'This action adds a new leaderboardEntry';
  }

  findAll() {
    return `This action returns all leaderboardEntry`;
  }

  findOne(id: number) {
    return `This action returns a #${id} leaderboardEntry`;
  }

  update(id: number, updateLeaderboardEntryDto: UpdateLeaderboardEntryDto) {
    return `This action updates a #${id} leaderboardEntry`;
  }

  remove(id: number) {
    return `This action removes a #${id} leaderboardEntry`;
  }
}
