import { DishSuitability } from './dish-suitability.model';
import { UserRole } from './user-role.model';

export interface UserProfile {
  id: string;
  username: string | null;
  name: string;
  role: UserRole;
  dietaryPreferences: DishSuitability[];
}
