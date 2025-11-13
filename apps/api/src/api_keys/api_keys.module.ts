import { ApiKey } from './entities/api_keys.entity';
import { ApiKeyController } from './api_keys.controller';
import { ApiKeyService } from './api_keys.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([ApiKey])],
	controllers: [ApiKeyController],
	providers: [ApiKeyService],
})
export class ApiKeyModule {}
