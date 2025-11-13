import { GameController } from './games.controller';
import { Games } from './entities/games.entity';
import { GamesService } from './games.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([Games])],
	controllers: [GameController],
	providers: [GamesService],
})
export class GameModule {}
