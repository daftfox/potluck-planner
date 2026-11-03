import { Dish } from './dish.model';

export type DishDetails = Omit<Dish, 'id' | 'broughtByUserId'>;
