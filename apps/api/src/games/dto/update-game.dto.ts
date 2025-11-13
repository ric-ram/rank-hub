import { CreateGameDto } from './create-game.dto';
import { PartialType } from '@nestjs/mapped-types';

/**
 * Payload to update a Game.
 * All fields from {@link CreateGameDto} are optional here.
 *
 * @export
 * @class UpdateGameDto
 * @typedef {UpdateGameDto}
 * @extends {PartialType(CreateGameDto)}
 */
export class UpdateGameDto extends PartialType(CreateGameDto) {}
