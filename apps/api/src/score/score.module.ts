import { Module } from '@nestjs/common';
import { Score } from './entities/score.entity';
import { ScoreController } from './score.controller';
import { ScoreService } from './score.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([Score])],
	controllers: [ScoreController],
	providers: [ScoreService],
})
export class ScoreModule {}
