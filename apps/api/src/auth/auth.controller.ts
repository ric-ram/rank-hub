import {
	BadRequestException,
	Body,
	Controller,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import express from 'express';
import { UserAdmin } from 'src/user-admin/entities/user-admin.entity';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginAdminResponseDto } from './dto/login-admin.dto';
import { RegisterAdminRequestDto } from './dto/register-admin.dto';
import { CookieErrorInterceptor } from './interceptors/cookie-error.interceptor';

/**
 * Request payload of an authenticated admin user
 *
 * @interface IAuthenticatedRequest
 * @typedef {IAuthenticatedRequest}
 * @extends {express.Request}
 */
interface IAuthenticatedRequest extends express.Request {
	adminId: string;
	cookies: Record<string, any>;
	signedCookies: Record<string, any>;
}

/**
 * Cookie name to store the refresh token
 *
 * @type {"refresh_token"}
 */
export const REFRESH_COOKIE = 'refresh_token';

/**
 * Refresh token cookie options
 *
 * @type {{ readonly httpOnly: true; readonly secure: true; readonly sameSite: "lax"; readonly path: "/auth"; }}
 */
export const COOKIE_OPTS = {
	httpOnly: true,
	secure: true,
	sameSite: 'lax',
	path: '/auth',
} as const;

/**
 * Controller of the authentication module
 *
 * Auth endpoints. Cookie handling:
 * - On success: controllers set/rotate/clear the 'refresh_token' cookie.
 * - On failure: AuthErrorCookieInterceptor clears the cookie.
 *
 * @export
 * @class AuthController
 * @typedef {AuthController}
 */
@UseInterceptors(CookieErrorInterceptor)
@Controller('auth')
export class AuthController {
	/**
	 * Creates an instance of AuthController.
	 *
	 * @constructor
	 * @param {AuthService} authService
	 */
	constructor(private readonly authService: AuthService) {}

	/**
	 * Log in with email/password (Local strategy). Sets refresh cookie and returns access token.
	 * @example POST /auth/login
	 *
	 * @async
	 * @param {(Request & { user: UserAdmin })} req
	 * @param {express.Response} resp
	 * @returns {Promise<LoginAdminResponseDto>}
	 * @throws {BadRequestException} Invalid credentials.
	 */
	@Post('login')
	@Public()
	@UseGuards(AuthGuard('local'))
	async login(
		@Req() req: Request & { user: UserAdmin },
		@Res({ passthrough: true }) resp: express.Response,
	): Promise<LoginAdminResponseDto> {
		const { access_token, refresh_token, expires_at } =
			await this.authService.login(req.user);

		resp.cookie(REFRESH_COOKIE, refresh_token, {
			...COOKIE_OPTS,
			maxAge: Number(expires_at),
		});

		return { access_token: access_token };
	}

	/**
	 * Register a new admin and log in immediately. Sets refresh cookie and returns access token.
	 * @example POST /auth/register
	 *
	 * @async
	 * @param {RegisterAdminRequestDto} registerBody
	 * @param {express.Response} resp
	 * @returns {Promise<LoginAdminResponseDto | BadRequestException>}
	 * @throws {BadRequestException | ConflictException} Email already in use.
	 */
	@Post('register')
	@Public()
	async register(
		@Body() registerBody: RegisterAdminRequestDto,
		@Res({ passthrough: true }) resp: express.Response,
	): Promise<LoginAdminResponseDto | BadRequestException> {
		const { access_token, refresh_token, expires_at } =
			await this.authService.register(registerBody);

		resp.cookie(REFRESH_COOKIE, refresh_token, {
			...COOKIE_OPTS,
			maxAge: Number(expires_at),
		});

		return { access_token: access_token };
	}

	/**
	 * Refresh access token using the HttpOnly refresh cookie. Rotates the refresh cookie.
	 * @example POST /auth/refresh
	 *
	 * @async
	 * @param {IAuthenticatedRequest} req
	 * @param {express.Response} resp
	 * @returns {Promise<LoginAdminResponseDto | BadRequestException>}
	 * @throws {UnauthorizedException} Missing/invalid/expired refresh token.
	 */
	@Post('refresh')
	@Public()
	async refresh(
		@Req() req: IAuthenticatedRequest,
		@Res({ passthrough: true }) resp: express.Response,
	): Promise<LoginAdminResponseDto | BadRequestException> {
		const cookieAny: unknown =
			req.signedCookies[REFRESH_COOKIE] ?? req.cookies[REFRESH_COOKIE];

		const refreshCookie: string | undefined =
			typeof cookieAny === 'string' ? cookieAny : undefined;

		if (!refreshCookie)
			throw new UnauthorizedException('Missing refresh token');

		const { refreshToken, expiresAt, adminId } =
			await this.authService.verifyAndRotateRefresh(refreshCookie);

		const accessToken = await this.authService.issueAccessToken(adminId);

		resp.cookie(REFRESH_COOKIE, refreshToken, {
			...COOKIE_OPTS,
			maxAge: Number(expiresAt),
		});

		return { access_token: accessToken };
	}

	/**
	 * Logout current session (JWT required). Revokes the matching refresh token and clears the cookie.
	 * @example POST /auth/logout
	 *
	 * @async
	 * @param {IAuthenticatedRequest} req
	 * @param {express.Response} resp
	 * @returns {Promise<{ success: true }>}
	 */
	@Post('logout')
	@UseGuards(AuthGuard('jwt'))
	async logout(
		@Req() req: IAuthenticatedRequest,
		@Res({ passthrough: true }) resp: express.Response,
	): Promise<{ success: true }> {
		const cookieAny: unknown =
			req.signedCookies[REFRESH_COOKIE] ?? req.cookies[REFRESH_COOKIE];

		const refreshCookie: string | undefined =
			typeof cookieAny === 'string' ? cookieAny : undefined;

		await this.authService.logout(req.adminId, refreshCookie);

		resp.clearCookie(REFRESH_COOKIE, COOKIE_OPTS);
		return { success: true };
	}

	/**
	 * Logout all sessions (JWT required). Revokes all refresh tokens and clears the cookie.
	 * @example POST /auth/logout-all
	 *
	 * @async
	 * @param {IAuthenticatedRequest} req
	 * @param {express.Response} resp
	 * @returns {Promise<{ success: true }>}
	 */
	@Post('logout-all')
	@UseGuards(AuthGuard('jwt'))
	async logoutAll(
		@Req() req: IAuthenticatedRequest,
		@Res({ passthrough: true }) resp: express.Response,
	): Promise<{ success: true }> {
		await this.authService.logoutAll(req.adminId);

		resp.clearCookie(REFRESH_COOKIE, COOKIE_OPTS);
		return { success: true };
	}
}
