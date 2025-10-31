import { CreateScoreDto } from './create-score.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateScoreDto extends PartialType(CreateScoreDto) {}
