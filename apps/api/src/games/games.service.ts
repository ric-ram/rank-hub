import {
	ConflictException,
	HttpException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { UserAdmin } from 'src/users-admin/entities/users-admin.entity';
import { In, Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { BulkDeleteResult } from './dto/delete-games.dto';
import { GameResponseDto } from './dto/response-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Games } from './entities/games.entity';

/**
 * Service responsible for the Business logic for Games (CRUD + bulk ops), enforcing ownership via `adminId`.
 *
 * @export
 * @class GamesService
 * @typedef {GamesService}
 */
@Injectable()
export class GamesService {
	/**
	 * Creates an instance of GamesService.
	 *
	 * @constructor
	 * @param {Repository<Games>} repo
	 * @param {PinoLogger} logger
	 */
	constructor(
		@InjectRepository(Games)
		private readonly repo: Repository<Games>,
		@InjectPinoLogger(GamesService.name)
		private readonly logger: PinoLogger,
	) {}

	/**
	 * Map a persisted `Games` entity to an API-facing `GameResponseDto`.
	 *
	 * @private
	 * @param {Games} entity Persisted game entity.
	 * @returns {GameResponseDto} DTO suitable for responses.
	 */
	private toResponseDto(entity: Games): GameResponseDto {
		return {
			id: entity.id,
			name: entity.name,
			shortCode: entity.shortCode,
			createdAt: entity.createdAt,
			createdById: entity.createdById, // or omit if you don’t want to expose it
		};
	}

	/**
	 * Extract a Postgres error code (e.g., `23505`) from a TypeORM/pg error shape.
	 *
	 * @private
	 * @param {unknown} err Unknown error thrown by the driver/query builder.
	 * @returns {(string | undefined)} The pg error code if present; otherwise undefined.
	 */
	private getPgCode(err: unknown): string | undefined {
		interface PgErr {
			code?: unknown;
		}
		interface QfErr {
			driverError?: PgErr;
			code?: unknown;
		}

		if (typeof err !== 'object' || err === null) return;
		const qe = err as QfErr;

		const direct = typeof qe.code === 'string' ? qe.code : undefined;
		const nested =
			typeof qe.driverError?.code === 'string'
				? qe.driverError.code
				: undefined;
		return direct ?? nested;
	}

	/**
	 * Create a new game owned by the given admin.
	 *
	 * @async
	 * @param {CreateGameDto} createGameDto Validated payload (name, shortCode).
	 * @param {string} adminId Owner admin UUID (from JWT).
	 * @returns {Promise<GameResponseDto>} Newly created game.
	 *
	 * @throws {ConflictException} If `shortCode` violates the unique constraint.
	 * @throws {InternalServerErrorException} On unexpected persistence errors.
	 * @throws {HttpException} Re-throws pre-built HTTP exceptions.
	 */
	async create(
		createGameDto: CreateGameDto,
		adminId: string,
	): Promise<GameResponseDto> {
		const entity = this.repo.create({
			...createGameDto,
			createdBy: { id: adminId } as UserAdmin,
		});

		try {
			const saved = await this.repo.save(entity);
			return this.toResponseDto(saved);
		} catch (e: any) {
			this.logger.error(
				{
					err: (e as Error)?.message,
					code: 'GAMES.CREATE',
				},
				'create a new game failed',
			);
			if (e instanceof HttpException) throw e;

			const code = this.getPgCode(e);
			if (code === '23505')
				throw new ConflictException('shortCode already exists');

			throw new InternalServerErrorException('GAMES.INTERNAL');
		}
	}

	/**
	 * List games for the authenticated admin with simple page/limit pagination.
	 *
	 * @async
	 * @param {string} adminId Owner admin UUID (from JWT).
	 * @param {?{ page?: number; limit?: number }} [opts] Pagination options (1-based page).
	 * @returns {Promise<GameResponseDto[]>} Page of games sorted by `createdAt` desc.
	 *
	 * @throws {InternalServerErrorException} On unexpected read errors.
	 */
	async findAll(
		adminId: string,
		opts?: { page?: number; limit?: number },
	): Promise<GameResponseDto[]> {
		const page = Math.max(1, Number(opts?.page) || 1);
		const limit = Math.min(50, Math.max(1, Number(opts?.limit) || 20));
		const skip = (page - 1) * limit;

		try {
			const rows = await this.repo.find({
				where: { createdById: adminId },
				order: { createdAt: 'DESC' },
				skip,
				take: opts?.limit,
			});
			const games: GameResponseDto[] = [];
			for (const row of rows) {
				games.push(this.toResponseDto(row));
			}

			return games;
		} catch (e: any) {
			this.logger.error(
				{
					err: (e as Error)?.message,
					code: 'GAMES.FIND_ALL',
				},
				'finding all games failed',
			);
			if (e instanceof HttpException) throw e;
			throw new InternalServerErrorException('GAMES.INTERNAL');
		}
	}

	/**
	 * Fetch a single game by id, enforcing ownership.
	 *
	 * @async
	 * @param {string} id Game UUID.
	 * @param {string} adminId Owner admin UUID (from JWT).
	 * @returns {Promise<GameResponseDto>} The requested game.
	 *
	 * @throws {NotFoundException} If the game does not exist or is not owned by admin.
	 * @throws {InternalServerErrorException} On unexpected read errors.
	 * @throws {HttpException} Re-throws pre-built HTTP exceptions.
	 */
	async findOne(id: string, adminId: string): Promise<GameResponseDto> {
		try {
			const game = await this.repo.findOne({
				where: { id, createdById: adminId },
			});

			if (!game) throw new NotFoundException('Game not Found');
			return this.toResponseDto(game);
		} catch (e: any) {
			this.logger.error(
				{
					err: (e as Error)?.message,
					code: 'GAMES.FIND_BY_ID',
				},
				`finding game with id: ${id} failed`,
			);
			if (e instanceof HttpException) throw e;
			throw new InternalServerErrorException('GAMES.INTERNAL');
		}
	}

	/**
	 * Update mutable fields of a game (owned by admin) and return the updated resource.
	 *
	 * @async
	 * @param {string} id Game UUID.
	 * @param {UpdateGameDto} updateGameDto Partial fields to update (e.g., name).
	 * @param {string} adminId Owner admin UUID (from JWT).
	 * @returns {Promise<GameResponseDto>} Updated game.
	 *
	 * @throws {NotFoundException} If the game does not exist or is not owned by admin.
	 * @throws {ConflictException} If `shortCode` conflicts with an existing game.
	 * @throws {InternalServerErrorException} On unexpected persistence errors.
	 * @throws {HttpException} Re-throws pre-built HTTP exceptions.
	 */
	async update(
		id: string,
		updateGameDto: UpdateGameDto,
		adminId: string,
	): Promise<GameResponseDto> {
		try {
			const existing = await this.repo.findOne({
				where: { id, createdById: adminId },
			});
			if (!existing) throw new NotFoundException('Game not found');

			const merged = this.repo.merge(existing, updateGameDto);

			const saved = await this.repo.save(merged);
			return this.toResponseDto(saved);
		} catch (e: any) {
			this.logger.error(
				{
					err: (e as Error)?.message,
					code: 'GAMES.UPDATE_GAME_BY_ID',
				},
				`updating game with id: ${id} failed`,
			);
			if (e instanceof HttpException) throw e;

			const code = this.getPgCode(e);
			if (code === '23505')
				throw new ConflictException('shortCode already exists');

			throw new InternalServerErrorException('GAMES.INTERNAL');
		}
	}

	/**
	 * Delete a single game by id, enforcing ownership.
	 *
	 * @async
	 * @param {string} id Game UUID.
	 * @param {string} adminId Owner admin UUID (from JWT).
	 * @returns {Promise<number>} Number of affected rows (0 or 1).
	 *
	 * @throws {InternalServerErrorException} On unexpected delete errors.
	 * @throws {HttpException} Re-throws pre-built HTTP exceptions.
	 */
	async deleteById(id: string, adminId: string): Promise<number> {
		try {
			const res = await this.repo.delete({ id, createdById: adminId });
			return res.affected ?? 0;
		} catch (e: any) {
			this.logger.error(
				{
					err: (e as Error)?.message,
					code: 'GAMES.DELETE_GAME_BY_ID',
				},
				`deleting game with id: ${id} failed`,
			);
			if (e instanceof HttpException) throw e;
			throw new InternalServerErrorException('GAMES.INTERNAL');
		}
	}

	/**
	 * Bulk delete selected games owned by the admin. Uses one bulk delete with
	 * `RETURNING id` to determine which rows were deleted, and classifies the rest.
	 *
	 * @async
	 * @param {string[]} ids Array of game UUIDs to delete (duplicates ignored).
	 * @param {string} adminId Owner admin UUID (from JWT).
	 * @returns {Promise<BulkDeleteResult>} Summary: { deleted, notFound, failed }.
	 *
	 * @throws {InternalServerErrorException} On unexpected query/delete errors.
	 * @throws {HttpException} Re-throws pre-built HTTP exceptions.
	 */
	async bulkDelete(
		ids: string[],
		adminId: string,
	): Promise<BulkDeleteResult> {
		try {
			const unique = Array.from(new Set(ids));

			const owned = await this.repo.find({
				where: { id: In(unique), createdById: adminId },
				select: ['id'],
			});
			const ownedIds = owned.map((g) => g.id);
			const notFound = unique.filter((id) => !ownedIds.includes(id));

			const res = await this.repo
				.createQueryBuilder()
				.delete()
				.from(Games)
				.where('id = ANY(:ids)', { ids: ownedIds })
				.returning(['id'])
				.execute();

			const deletedRows = res.raw as { id: string }[];
			const deleted = deletedRows.map((r) => r.id);

			// TODO: Refine reason for failure
			const failed = ownedIds
				.filter((id) => !deleted.includes(id))
				.map((id) => ({ id, reason: 'UNKNOWN' }));

			return { deleted, notFound, failed };
		} catch (e: any) {
			this.logger.error(
				{
					err: (e as Error)?.message,
					code: 'GAMES.BULK_DELETE_GAMES',
				},
				'deleting multiple games failed',
			);
			if (e instanceof HttpException) throw e;
			throw new InternalServerErrorException('GAMES.INTERNAL');
		}
	}

	/**
	 * Delete all games owned by the current admin.
	 *
	 * @async
	 * @param {string} adminId Owner admin UUID (from JWT).
	 * @returns {Promise<number>} Number of deleted rows.
	 *
	 * @throws {InternalServerErrorException} On unexpected delete errors.
	 * @throws {HttpException} Re-throws pre-built HTTP exceptions.
	 */
	async deleteAll(adminId: string): Promise<number> {
		try {
			const res = await this.repo.delete({ createdById: adminId });
			return res.affected ?? 0;
		} catch (e: any) {
			this.logger.error(
				{
					err: (e as Error)?.message,
					code: 'GAMES.DELETE_ALL_GAMES',
				},
				'deleting all games failed',
			);
			if (e instanceof HttpException) throw e;
			throw new InternalServerErrorException('GAMES.INTERNAL');
		}
	}
}
