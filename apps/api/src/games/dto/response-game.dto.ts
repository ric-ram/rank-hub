import { ApiProperty } from '@nestjs/swagger';

/**
 * API response shape for a Game resource.
 * This is returned by controllers (never persisted directly).
 *
 * @export
 * @class GameResponseDto
 * @typedef {GameResponseDto}
 */
export class GameResponseDto {
	/**
	 * Game UUID.
	 *
	 * @type {!string}
	 */
	@ApiProperty({ format: 'uuid' })
	id!: string;

	/**
	 * Human-readable name.
	 *
	 * @type {!string}
	 */
	@ApiProperty()
	name!: string;

	/**
	 * Uppercase short code uniquely identifying the game for the owner.
	 *
	 * @type {!string}
	 */
	@ApiProperty({ example: 'TESTGAME' })
	shortCode!: string;

	/**
	 * Creation timestamp (ISO8601).
	 *
	 * @type {!Date}
	 */
	@ApiProperty({ format: 'date-time' })
	createdAt!: Date;

	/**
	 * Owner admin UUID (foreign key).
	 *
	 * @type {!string}
	 */
	@ApiProperty({ format: 'uuid' })
	createdById!: string;
}
