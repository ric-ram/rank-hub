import { ApiKey } from './entities/api_key.entity';
import { ApiKeyController } from './api_key.controller';
import { ApiKeyService } from './api_key.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([ApiKey])],
	controllers: [ApiKeyController],
	providers: [ApiKeyService],
})
export class ApiKeyModule {}
