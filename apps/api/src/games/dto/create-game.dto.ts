import { IsNotEmpty, IsString, Matches } from 'class-validator';

/**
 * Payload to create a new Game.
 *
 * @export
 * @class CreateGameDto
 * @typedef {CreateGameDto}
 */
export class CreateGameDto {
	/**
	 * Display name for the game.
	 *
	 * @type {string}
	 */
	@IsNotEmpty()
	@IsString()
	name: string;

	/**
	 * Uppercase short code (3–12 chars; A–Z, 0–9, underscore).
	 * Used as a stable, unique identifier per admin.
	 *
	 * @type {string}
	 *
	 * @example "TEST_GAME"
	 */
	@IsNotEmpty()
	@IsString()
	@Matches(/^[A-Z0-9_]{3,12}$/)
	shortCode: string;
}
