import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserAdmin } from 'src/user-admin/entities/user-admin.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		super({
			usernameField: 'email',
		});
	}

	async validate(email: string, password: string): Promise<UserAdmin> {
		const user = await this.authService.validateUser(email, password);
		if (!user) {
			throw new UnauthorizedException();
		}
		return user;
	}
}
