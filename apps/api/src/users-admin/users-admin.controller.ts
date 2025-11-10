import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { UserAdminService } from './users-admin.service';

@Controller('user-admin')
export class UserAdminController {
	constructor(private readonly userAdminService: UserAdminService) {}

	@Post()
	create(@Body() createUserAdminDto: CreateUserAdminDto) {
		return this.userAdminService.create(createUserAdminDto);
	}

	@Get()
	findAll() {
		return this.userAdminService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.userAdminService.findOneById(id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateUserAdminDto: UpdateUserAdminDto,
	) {
		return this.userAdminService.update(id, updateUserAdminDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.userAdminService.remove(id);
	}
}
