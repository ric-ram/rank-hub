import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAdmin } from './entities/users-admin.entity';
import { UserAdminController } from './users-admin.controller';
import { UserAdminService } from './users-admin.service';

@Module({
	imports: [TypeOrmModule.forFeature([UserAdmin])],
	controllers: [UserAdminController],
	providers: [UserAdminService],
	exports: [TypeOrmModule, UserAdminService],
})
export class UserAdminModule {}
