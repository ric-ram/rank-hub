import { Module } from '@nestjs/common';
import { Score } from './entities/scores.entity';
import { ScoreController } from './scores.controller';
import { ScoreService } from './scores.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([Score])],
	controllers: [ScoreController],
	providers: [ScoreService],
})
export class ScoreModule {}
