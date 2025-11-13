import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Headers,
	HttpCode,
	NotFoundException,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiHeader,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiQuery,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CurrentAdminId } from 'src/auth/decorators/current-user.decorator';
import { CreateGameDto } from './dto/create-game.dto';
import { BulkDeleteGamesDto, BulkDeleteResult } from './dto/delete-games.dto';
import { GameResponseDto } from './dto/response-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GamesService } from './games.service';

/**
 * HTTP controller for Games.
 *
 * Exposes CRUD and bulk operations, all guarded by JWT and scoped to the
 * authenticated admin (via `@CurrentAdminId()`).
 *
 * @export
 * @class GameController
 * @typedef {GameController}
 */
@Controller('games')
export class GameController {
	/**
	 * Creates an instance of GameController.
	 *
	 * @constructor
	 * @param {GamesService} gamesService
	 * @param {PinoLogger} logger
	 */
	constructor(
		private readonly gamesService: GamesService,
		@InjectPinoLogger(GameController.name)
		private readonly logger: PinoLogger,
	) {}

	/**
	 * Description placeholder
	 *
	 * @async
	 * @param {CreateGameDto} createGameDto Validated payload (name, shortCode).
	 * @param {string} adminId Admin UUID extracted from the access token.
	 * @returns {Promise<GameResponseDto>} Newly created game resource.
	 */
	@Post()
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	@ApiCreatedResponse({ description: 'Game created', type: GameResponseDto })
	@ApiBadRequestResponse({ description: 'Validation error' })
	@ApiConflictResponse({ description: 'shortCode already exists' })
	@ApiUnauthorizedResponse({ description: 'Missing/invalid token' })
	async create(
		@Body() createGameDto: CreateGameDto,
		@CurrentAdminId() adminId: string,
	): Promise<GameResponseDto> {
		this.logger.warn('--> ' + adminId);

		return await this.gamesService.create(createGameDto, adminId);
	}

	/**
	 * List games for the authenticated admin with optional pagination.
	 *
	 * @async
	 * @param {string} adminId Admin UUID from the access token.
	 * @param {?number} page 1-based page index (default: 1).
	 * @param {?number} limit Page size (default: 20, max: 50).
	 * @returns {Promise<GameResponseDto[]>} A page of games sorted by `createdAt` desc.
	 */
	@Get()
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	@ApiOkResponse({
		description: 'Games for the authenticated admin',
		type: [GameResponseDto],
	})
	@ApiUnauthorizedResponse({ description: 'Missing/invalid token' })
	@ApiQuery({ name: 'page', required: false, example: 1 })
	@ApiQuery({ name: 'limit', required: false, example: 20 })
	async findAll(
		@CurrentAdminId() adminId: string,
		@Query('page') page?: number,
		@Query('limit') limit?: number,
	): Promise<GameResponseDto[]> {
		return await this.gamesService.findAll(adminId, { page, limit });
	}

	/**
	 * Fetch a single game by id, enforcing ownership.
	 *
	 * @async
	 * @param {string} id Game UUID.
	 * @param {string} adminId Admin UUID from the access token.
	 * @returns {Promise<GameResponseDto>} The requested game.
	 *
	 * @throws {NotFoundException} If the game does not exist or is not owned by the admin.
	 */
	@Get(':id')
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	@ApiOkResponse({ type: GameResponseDto })
	@ApiNotFoundResponse({ description: 'Game not found' })
	@ApiUnauthorizedResponse({ description: 'Missing/invalid token' })
	async findOne(
		@Param('id') id: string,
		@CurrentAdminId() adminId: string,
	): Promise<GameResponseDto> {
		return this.gamesService.findOne(id, adminId);
	}

	/**
	 * Update mutable fields of a game (owned by the admin) and return the updated resource.
	 *
	 * @async
	 * @param {string} id - Game UUID.
	 * @param {UpdateGameDto} updateGameDto - Partial fields to update (e.g., name).
	 * @param {string} adminId - Admin UUID from the access token.
	 * @returns {Promise<GameResponseDto>} Updated game.
	 *
	 * @throws {NotFoundException} If the game does not exist or is not owned by the admin.
	 * @throws {ConflictException} If `shortCode` violates a unique constraint.
	 */
	@Patch(':id')
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	@ApiOkResponse({ type: GameResponseDto })
	@ApiNotFoundResponse({ description: 'Game not found' })
	@ApiConflictResponse({ description: 'shortCode already exists' })
	@ApiUnauthorizedResponse({ description: 'Missing/invalid token' })
	async update(
		@Param('id') id: string,
		@Body() updateGameDto: UpdateGameDto,
		@CurrentAdminId() adminId: string,
	): Promise<GameResponseDto> {
		return await this.gamesService.update(id, updateGameDto, adminId);
	}

	/**
	 * Delete a single game by id, enforcing ownership.
	 *
	 * @async
	 * @param {string} id - Game UUID.
	 * @param {string} adminId - Admin UUID from the access token.
	 * @returns {Promise<void>} No body on success.
	 *
	 * @throws {NotFoundException} If the game does not exist or is not owned by the admin.
	 */
	@Delete(':id')
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	@HttpCode(204)
	@ApiUnauthorizedResponse({ description: 'Missing/invalid token' })
	async deleteById(
		@Param('id') id: string,
		@CurrentAdminId() adminId: string,
	): Promise<void> {
		const affected = await this.gamesService.deleteById(id, adminId);
		if (!affected) throw new NotFoundException('Game not found');
	}

	/**
	 * Bulk delete selected games for the authenticated admin.
	 *
	 * Uses a server-side bulk operation and returns a summary indicating which ids
	 * were deleted, which were not found/owned, and which failed (with reasons when available).
	 *
	 * @async
	 * @param {BulkDeleteGamesDto} bulkDeleteGamesDto - `{ ids: string[] }` of game UUIDs.
	 * @param {string} adminId - Admin UUID from the access token.
	 * @returns {Promise<BulkDeleteResult>} Summary `{ deleted, notFound, failed }`.
	 */
	@Post('games:bulk-delete')
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	@ApiOkResponse({ description: 'Bulk delete result' })
	@ApiUnauthorizedResponse({ description: 'Missing/invalid token' })
	async deleteBulk(
		@Body() bulkDeleteGamesDto: BulkDeleteGamesDto,
		@CurrentAdminId() adminId: string,
	): Promise<BulkDeleteResult> {
		return await this.gamesService.bulkDelete(
			bulkDeleteGamesDto.ids,
			adminId,
		);
	}

	/**
	 * Delete **all** games owned by the authenticated admin.
	 *
	 * Requires an explicit confirmation header to prevent accidental mass deletions.
	 *
	 * @async
	 * @param {string} adminId - Admin UUID extracted from the access token.
	 * @param {string} hdr - Confirmation header value from `x-confirm-delete`; must equal `"all"`.
	 * @returns {Promise<{ deletedCount: number }>} Object with the number of deleted rows.
	 *
	 * @throws {BadRequestException} If `x-confirm-delete` header is missing or not equal to `"all"`.
	 * @throws {UnauthorizedException} If the bearer token is missing/invalid (guard-level).
	 *
	 * @example
	 *
	 * curl -X DELETE "http://localhost:3001/api/v1/games" \
	 *   -H "Authorization: Bearer <ACCESS_TOKEN>" \
	 *   -H "x-confirm-delete: all"
	 */
	@Delete()
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	@HttpCode(200)
	@ApiHeader({
		name: 'x-confirm-delete',
		required: true,
		description: 'Must be "all"',
	})
	@ApiOkResponse({ description: 'Number of games deleted' })
	@ApiUnauthorizedResponse({ description: 'Missing/invalid token' })
	async deleteAll(
		@CurrentAdminId() adminId: string,
		@Headers('x-confirm-delete') hdr: string,
	): Promise<{ deletedCount: number }> {
		if (hdr !== 'all')
			throw new BadRequestException('Missing x-confirm-delete: all');

		const deletedCount = await this.gamesService.deleteAll(adminId);
		return { deletedCount };
	}
}
