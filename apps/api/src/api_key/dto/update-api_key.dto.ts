import { CreateApiKeyDto } from './create-api_key.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateApiKeyDto extends PartialType(CreateApiKeyDto) {}
