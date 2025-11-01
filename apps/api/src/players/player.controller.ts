import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayerService } from './player.service';

@Controller('players')
export class PlayerController {
	constructor(private readonly playerService: PlayerService) {}

	@Post()
	create(@Body() createPlayerDto: CreatePlayerDto) {
		return this.playerService.create(createPlayerDto);
	}

	@Get()
	findAll() {
		return this.playerService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.playerService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updatePlayerDto: UpdatePlayerDto) {
		return this.playerService.update(id, updatePlayerDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.playerService.remove(id);
	}
}
