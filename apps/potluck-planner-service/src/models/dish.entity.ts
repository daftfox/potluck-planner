import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { DietaryRestriction } from './dietary-restriction.enum';

@Entity('dishes')
export class Dish {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  recipeNotes: string;

  @Column({
    type: 'enum',
    enum: DietaryRestriction,
    array: true,
    nullable: true,
  })
  suitableFor: string[];
}
