import { IsEnum } from 'class-validator';
import { UserRole } from '../models/user-role';

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}
