import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'photos' })
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'owner_user_id', type: 'uuid' })
  ownerUserId!: string;

  @Column({ name: 'content_type', type: 'varchar', length: 40 })
  contentType!: string;

  @Column({ type: 'bytea' })
  data!: Buffer;
}
