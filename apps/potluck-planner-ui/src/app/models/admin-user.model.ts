import { UserRole } from './user-role.model';

export interface AdminUser {
  id: string;
  username: string | null;
  name: string;
  role: UserRole;
}
