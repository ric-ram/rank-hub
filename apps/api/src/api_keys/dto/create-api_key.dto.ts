import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateApiKeyDto {
	@IsUUID()
	gameId: string;

	@IsOptional()
	@IsString()
	label?: string;
}
