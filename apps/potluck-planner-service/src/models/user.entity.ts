import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { DietaryRestriction } from './dietary-restriction.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  displayName: string;

  @Column({
    type: 'enum',
    enum: DietaryRestriction,
    array: true,
    nullable: true,
  })
  dietaryRestrictions: DietaryRestriction[];
}
