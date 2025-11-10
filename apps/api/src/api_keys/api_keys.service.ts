import { CreateApiKeyDto } from './dto/create-api_key.dto';
import { Injectable } from '@nestjs/common';
import { UpdateApiKeyDto } from './dto/update-api_key.dto';

@Injectable()
export class ApiKeyService {
	create(createApiKeyDto: CreateApiKeyDto) {
		return 'This action adds a new apiKey';
	}

	findAll() {
		return `This action returns all apiKey`;
	}

	findOne(id: string) {
		return `This action returns a #${id} apiKey`;
	}

	update(id: string, updateApiKeyDto: UpdateApiKeyDto) {
		return `This action updates a #${id} apiKey`;
	}

	remove(id: string) {
		return `This action removes a #${id} apiKey`;
	}
}
