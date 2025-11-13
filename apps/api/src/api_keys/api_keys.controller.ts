import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { ApiKeyService } from './api_keys.service';
import { CreateApiKeyDto } from './dto/create-api_key.dto';
import { UpdateApiKeyDto } from './dto/update-api_key.dto';

@Controller('api-keys')
export class ApiKeyController {
	constructor(private readonly apiKeyService: ApiKeyService) {}

	@Post()
	create(@Body() createApiKeyDto: CreateApiKeyDto) {
		return this.apiKeyService.create(createApiKeyDto);
	}

	@Get()
	findAll() {
		return this.apiKeyService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.apiKeyService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateApiKeyDto: UpdateApiKeyDto) {
		return this.apiKeyService.update(id, updateApiKeyDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.apiKeyService.remove(id);
	}
}
