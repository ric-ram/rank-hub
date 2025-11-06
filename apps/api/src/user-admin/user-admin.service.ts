import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { UserAdmin } from './entities/user-admin.entity';

@Injectable()
export class UserAdminService {
	constructor(
		@InjectRepository(UserAdmin)
		private readonly repo: Repository<UserAdmin>,
	) {}

	create(createUserAdminDto: CreateUserAdminDto): Promise<UserAdmin> {
		return this.repo.save(createUserAdminDto);
	}

	findAll(): Promise<UserAdmin[]> {
		return this.repo.find();
	}

	findOneById(id: string): Promise<UserAdmin | null> {
		return this.repo.findOneBy({ id });
	}

	findOneByEmail(email: string): Promise<UserAdmin | null> {
		return this.repo.findOneBy({ email });
	}

	update(
		id: string,
		updateUserAdminDto: UpdateUserAdminDto,
	): Promise<UpdateResult> {
		return this.repo.update({ id }, updateUserAdminDto);
	}

	remove(id: string): Promise<DeleteResult> {
		return this.repo.delete({ id });
	}
}
