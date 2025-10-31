import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlayerAchievementService } from './player_achievement.service';
import { CreatePlayerAchievementDto } from './dto/create-player_achievement.dto';
import { UpdatePlayerAchievementDto } from './dto/update-player_achievement.dto';

@Controller('player-achievement')
export class PlayerAchievementController {
  constructor(private readonly playerAchievementService: PlayerAchievementService) {}

  @Post()
  create(@Body() createPlayerAchievementDto: CreatePlayerAchievementDto) {
    return this.playerAchievementService.create(createPlayerAchievementDto);
  }

  @Get()
  findAll() {
    return this.playerAchievementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playerAchievementService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlayerAchievementDto: UpdatePlayerAchievementDto) {
    return this.playerAchievementService.update(+id, updatePlayerAchievementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playerAchievementService.remove(+id);
  }
}
