import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'pot_lucks' })
export class PotLuck {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  title!: string;

  @Column({ name: 'starts_on', type: 'date' })
  startsOn!: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime!: string;

  @Column({ type: 'varchar', length: 200 })
  location!: string;

  @Column({ type: 'varchar', length: 80 })
  organiser!: string;

  @Index()
  @Column({ name: 'organiser_user_id', type: 'uuid', nullable: true })
  organiserUserId!: string | null;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl!: string | null;

  @Column({ name: 'image_alt', type: 'varchar', length: 200, nullable: true })
  imageAlt!: string | null;
}
