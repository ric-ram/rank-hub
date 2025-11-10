import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Games } from './entities/games.entity';

@Injectable()
export class GameService {
	constructor(
		@InjectRepository(Games)
		private readonly repo: Repository<Games>,
	) {}
	create(createGameDto: CreateGameDto) {
		return this.repo.save(createGameDto);
	}

	findAll() {
		return `This action returns all game`;
	}

	findOne(id: string) {
		return `This action returns a #${id} game`;
	}

	update(id: string, updateGameDto: UpdateGameDto) {
		return `This action updates a #${id} game`;
	}

	remove(id: string) {
		return `This action removes a #${id} game`;
	}
}
