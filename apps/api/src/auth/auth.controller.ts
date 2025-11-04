import {
	BadRequestException,
	Body,
	Controller,
	Post,
	Request,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserAdmin } from 'src/user-admin/entities/user-admin.entity';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginAdminResponseDto } from './entities/login-admin.dto';
import { RegisterAdminRequestDto } from './entities/register-admin.dto';

@Public()
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}
	@UseGuards(AuthGuard('local'))
	@Post('login')
	async login(
		@Request() req: Request & { user: UserAdmin },
	): Promise<LoginAdminResponseDto> {
		return this.authService.login(req.user);
	}
	@Post('register')
	async register(
		@Body() registerBody: RegisterAdminRequestDto,
	): Promise<LoginAdminResponseDto | BadRequestException> {
		return await this.authService.register(registerBody);
	}
}
