import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePotluckFeatured1783040400000 implements MigrationInterface {
  name = 'RemovePotluckFeatured1783040400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_pot_lucks_featured"');
    await queryRunner.query('ALTER TABLE "pot_lucks" DROP COLUMN "featured"');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "pot_lucks" ADD COLUMN "featured" boolean NOT NULL DEFAULT false');
    await queryRunner.query('CREATE INDEX "IDX_pot_lucks_featured" ON "pot_lucks" ("featured")');
  }
}
