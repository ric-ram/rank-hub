import { ArrayMaxSize, ArrayMinSize, IsArray, IsUUID } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

/**
 * Payload for bulk deletion of games.
 * Accepts up to 100 UUIDs per request.
 *
 * @export
 * @class BulkDeleteGamesDto
 * @typedef {BulkDeleteGamesDto}
 */
export class BulkDeleteGamesDto {
	/**
	 * Game UUIDs to delete. Duplicates are ignored server-side.
	 *
	 * @type {!string[]}
	 */
	@ApiProperty({ type: [String], example: ['uuid-1', 'uuid-2'] })
	@IsArray()
	@ArrayMinSize(1)
	@ArrayMaxSize(100) // safety cap
	@IsUUID('4', { each: true })
	ids!: string[];
}

/**
 * Result summary for a bulk delete operation.
 *
 * @export
 * @class BulkDeleteResult
 * @typedef {BulkDeleteResult}
 */
export class BulkDeleteResult {
	/**
	 * Successfully deleted game IDs.
	 *
	 * @type {string[]}
	 */
	deleted: string[];
	/**
	 * Requested IDs that were not found/owned.
	 *
	 * @type {string[]}
	 */
	notFound: string[];
	/**
	 * IDs that failed to delete (e.g., FK constraint), with a concise reason.
	 *
	 * @type {{ id: string; reason: string }[]}
	 */
	failed: { id: string; reason: string }[];
}
