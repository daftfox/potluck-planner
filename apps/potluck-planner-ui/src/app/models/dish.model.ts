import { DishSuitability } from './dish-suitability.model';

export interface Dish {
  id: string;
  name: string;
  broughtByUserId?: string;
  description?: string;
  photoUrl?: string;
  prepNotes?: string;
  suitableFor?: DishSuitability[];
}
