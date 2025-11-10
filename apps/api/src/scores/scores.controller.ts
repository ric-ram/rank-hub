import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { ScoreService } from './scores.service';

@Controller('score')
export class ScoreController {
	constructor(private readonly scoreService: ScoreService) {}

	@Post()
	create(@Body() createScoreDto: CreateScoreDto) {
		return this.scoreService.create(createScoreDto);
	}

	@Get()
	findAll() {
		return this.scoreService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.scoreService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateScoreDto: UpdateScoreDto) {
		return this.scoreService.update(+id, updateScoreDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.scoreService.remove(+id);
	}
}
