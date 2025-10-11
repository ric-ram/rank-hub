import { Injectable } from '@nestjs/common';
import { CreatePlayerAchievementDto } from './dto/create-player_achievement.dto';
import { UpdatePlayerAchievementDto } from './dto/update-player_achievement.dto';

@Injectable()
export class PlayerAchievementService {
  create(createPlayerAchievementDto: CreatePlayerAchievementDto) {
    return 'This action adds a new playerAchievement';
  }

  findAll() {
    return `This action returns all playerAchievement`;
  }

  findOne(id: number) {
    return `This action returns a #${id} playerAchievement`;
  }

  update(id: number, updatePlayerAchievementDto: UpdatePlayerAchievementDto) {
    return `This action updates a #${id} playerAchievement`;
  }

  remove(id: number) {
    return `This action removes a #${id} playerAchievement`;
  }
}
