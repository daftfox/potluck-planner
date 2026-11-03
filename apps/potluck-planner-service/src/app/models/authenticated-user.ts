import { DishSuitability } from './dish-suitability';
import { UserRole } from './user-role';

export interface AuthenticatedUser {
  id: string;
  username: string | null;
  name: string;
  role: UserRole;
  dietaryPreferences: DishSuitability[];
  jwtId: string;
}
