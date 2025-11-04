import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAdmin } from './entities/user-admin.entity';
import { UserAdminController } from './user-admin.controller';
import { UserAdminService } from './user-admin.service';

@Module({
	imports: [TypeOrmModule.forFeature([UserAdmin])],
	controllers: [UserAdminController],
	providers: [UserAdminService],
	exports: [TypeOrmModule, UserAdminService],
})
export class UserAdminModule {}
