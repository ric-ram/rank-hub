import { CreateUserAdminDto } from './create-user-admin.dto';
import { PartialType } from '@nestjs/mapped-types';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class UpdateUserAdminDto extends PartialType(CreateUserAdminDto) {}
