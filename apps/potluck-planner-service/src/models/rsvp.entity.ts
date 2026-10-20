import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Potluck } from './potluck.entity';
import { User } from './user.entity';
import { Dish } from './dish.entity';

@Entity('rsvps')
export class RSVP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Potluck)
  @JoinColumn({ name: 'potluckId' })
  potluck: Potluck;

  @JoinColumn({ name: 'potluckId' })
  @Column('uuid')
  potluckId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @JoinColumn({ name: 'userId' })
  @Column('uuid')
  userId: string;

  @Column({ type: 'boolean', default: true })
  attending: boolean;

  @ManyToOne(() => Dish, { nullable: true })
  @JoinColumn({ name: 'dishId' })
  dish: Dish;

  @JoinColumn({ name: 'dishId' })
  @Column('uuid', { nullable: true })
  dishId: string;
}
