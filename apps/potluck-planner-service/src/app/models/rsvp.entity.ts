import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { RsvpStatus } from './rsvp-status';

@Entity({ name: 'pot_luck_rsvps' })
@Unique('UQ_pot_luck_rsvps_event_user', ['potluckId', 'userId'])
export class PotLuckRsvp {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'potluck_id', type: 'uuid' })
  potluckId!: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 20 })
  status!: RsvpStatus;
}
