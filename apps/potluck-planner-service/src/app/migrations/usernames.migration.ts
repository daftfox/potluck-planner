import { MigrationInterface, QueryRunner } from 'typeorm';

export class Usernames1783040300000 implements MigrationInterface {
  name = 'Usernames1783040300000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_accounts"
      ADD COLUMN "username" varchar(80),
      ADD CONSTRAINT "CHK_user_accounts_username"
      CHECK ("username" ~ '^[a-zA-Z0-9._-]+$')
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_user_accounts_username"
      ON "user_accounts" (LOWER("username"))
    `);
    await queryRunner.query(`
      UPDATE "user_accounts" SET "username" = 'Sloddervos'
      WHERE "name_key" = 'timothy claassens'
    `);
    await queryRunner.query('ALTER TABLE "user_accounts" DROP COLUMN "name_key"');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user_accounts" ADD COLUMN "name_key" varchar(80)');
    await queryRunner.query('UPDATE "user_accounts" SET "name_key" = LOWER("name")');
    await queryRunner.query(`
      ALTER TABLE "user_accounts"
      ALTER COLUMN "name_key" SET NOT NULL,
      ADD CONSTRAINT "UQ_user_accounts_name_key" UNIQUE ("name_key")
    `);
    await queryRunner.query('ALTER TABLE "user_accounts" DROP COLUMN "username"');
  }
}
