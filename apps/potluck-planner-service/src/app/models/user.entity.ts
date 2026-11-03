import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DishSuitability } from './dish-suitability';
import { UserRole } from './user-role';

@Entity({ name: 'user_accounts' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 80 })
  name!: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  username!: string | null;

  @Column({ name: 'password_hash', type: 'varchar', length: 100, select: false })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 20, default: 'member' })
  role!: UserRole;

  @Column({ name: 'dietary_preferences', type: 'jsonb', default: () => "'[]'::jsonb" })
  dietaryPreferences!: DishSuitability[];
}
