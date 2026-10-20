import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('potlucks')
export class Potluck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'organiserId' })
  organiser: User;

  @JoinColumn({ name: 'organiserId' })
  @Column('uuid')
  organiserId: string;

  @Column({ type: 'date' })
  date: Date;
}
