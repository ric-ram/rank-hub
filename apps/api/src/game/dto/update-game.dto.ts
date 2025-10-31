import { CreateGameDto } from './create-game.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateGameDto extends PartialType(CreateGameDto) {}
