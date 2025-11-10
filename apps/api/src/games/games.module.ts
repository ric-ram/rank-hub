import { GameController } from './games.controller';
import { GameService } from './games.service';
import { Games } from './entities/games.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([Games])],
	controllers: [GameController],
	providers: [GameService],
})
export class GameModule {}
