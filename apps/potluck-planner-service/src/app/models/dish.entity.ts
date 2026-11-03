import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { DishSuitability } from './dish-suitability';

@Entity({ name: 'dishes' })
export class Dish {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'potluck_id', type: 'uuid' })
  potluckId!: string;

  @Index()
  @Column({ name: 'brought_by_user_id', type: 'uuid', nullable: true })
  broughtByUserId!: string | null;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ name: 'photo_url', type: 'text', nullable: true })
  photoUrl!: string | null;

  @Column({ name: 'prep_notes', type: 'text', default: '' })
  prepNotes!: string;

  @Column({ name: 'suitable_for', type: 'jsonb', default: () => "'[]'::jsonb" })
  suitableFor!: DishSuitability[];

  @Column({ name: 'hidden_after_rsvp', type: 'boolean', default: false })
  hiddenAfterRsvp!: boolean;
}
