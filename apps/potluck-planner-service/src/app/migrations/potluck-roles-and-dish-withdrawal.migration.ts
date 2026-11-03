import { MigrationInterface, QueryRunner } from 'typeorm';

export class PotluckRolesAndDishWithdrawal1783040100000 implements MigrationInterface {
  name = 'PotluckRolesAndDishWithdrawal1783040100000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_accounts"
      ADD CONSTRAINT "CHK_user_accounts_role"
      CHECK ("role" IN ('admin', 'member'))
    `);
    await queryRunner.query(`
      ALTER TABLE "dishes"
      ADD COLUMN "hidden_after_rsvp" boolean NOT NULL DEFAULT false
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "dishes" DROP COLUMN "hidden_after_rsvp"');
    await queryRunner.query('ALTER TABLE "user_accounts" DROP CONSTRAINT "CHK_user_accounts_role"');
  }
}
