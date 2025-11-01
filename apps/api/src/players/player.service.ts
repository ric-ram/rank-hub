import { CreatePlayerDto } from './dto/create-player.dto';
import { Injectable } from '@nestjs/common';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Injectable()
export class PlayerService {
	create(createPlayerDto: CreatePlayerDto) {
		return 'This action adds a new player';
	}

	findAll() {
		return `This action returns all player`;
	}

	findOne(id: string) {
		return `This action returns a #${id} player`;
	}

	update(id: string, updatePlayerDto: UpdatePlayerDto) {
		return `This action updates a #${id} player`;
	}

	remove(id: string) {
		return `This action removes a #${id} player`;
	}
}
