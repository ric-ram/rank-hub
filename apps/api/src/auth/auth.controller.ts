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

interface IAuthenticatedRequest extends express.Request {
	adminId: string;
	cookies: Record<string, any>;
	signedCookies: Record<string, any>;
}

export const REFRESH_COOKIE = 'refresh_token';
export const COOKIE_OPTS = {
	httpOnly: true,
	secure: true,
	sameSite: 'lax',
	path: '/auth',
} as const;

@UseInterceptors(CookieErrorInterceptor)
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

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
