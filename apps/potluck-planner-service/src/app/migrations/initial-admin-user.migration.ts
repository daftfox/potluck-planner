import { hash } from 'bcryptjs';
import { MigrationInterface, QueryRunner } from 'typeorm';

const INITIAL_ADMIN_NAME = 'Timothy Claassens';
const PASSWORD_HASH_ROUNDS = 12;

export class InitialAdminUser1783040200000 implements MigrationInterface {
  name = 'InitialAdminUser1783040200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const password = process.env.INITIAL_ADMIN_PASSWORD;
    if (!password || password.length < 8) {
      throw new Error(
        'Set INITIAL_ADMIN_PASSWORD to at least 8 characters before running the initial admin migration.',
      );
    }

    const passwordHash = await hash(password, PASSWORD_HASH_ROUNDS);
    await queryRunner.query(
      `
        INSERT INTO "user_accounts" ("name", "name_key", "password_hash", "role", "dietary_preferences")
        VALUES ($1, $2, $3, 'admin', '[]'::jsonb)
        ON CONFLICT ("name_key") DO UPDATE
        SET "role" = 'admin', "password_hash" = EXCLUDED."password_hash"
      `,
      [INITIAL_ADMIN_NAME, INITIAL_ADMIN_NAME.toLocaleLowerCase('en'), passwordHash],
    );
  }

  async down(): Promise<void> {
    throw new Error(
      'The initial admin migration cannot be rolled back safely because the account may own application data.',
    );
  }
}
