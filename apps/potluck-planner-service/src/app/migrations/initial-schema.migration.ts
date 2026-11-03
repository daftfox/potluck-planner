import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1783040000000 implements MigrationInterface {
  name = 'InitialSchema1783040000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_accounts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(80) NOT NULL,
        "name_key" varchar(80) NOT NULL UNIQUE,
        "password_hash" varchar(100) NOT NULL,
        "role" varchar(20) NOT NULL DEFAULT 'member',
        "dietary_preferences" jsonb NOT NULL DEFAULT '[]'::jsonb
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "pot_lucks" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" varchar(120) NOT NULL,
        "starts_on" date NOT NULL,
        "start_time" time NOT NULL,
        "location" varchar(200) NOT NULL,
        "organiser" varchar(80) NOT NULL,
        "organiser_user_id" uuid REFERENCES "user_accounts"("id") ON DELETE SET NULL,
        "description" text NOT NULL DEFAULT '',
        "image_url" text,
        "image_alt" varchar(200),
        "featured" boolean NOT NULL DEFAULT false
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "dishes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "potluck_id" uuid NOT NULL REFERENCES "pot_lucks"("id") ON DELETE CASCADE,
        "brought_by_user_id" uuid REFERENCES "user_accounts"("id") ON DELETE SET NULL,
        "name" varchar(120) NOT NULL,
        "description" text NOT NULL DEFAULT '',
        "photo_url" text,
        "prep_notes" text NOT NULL DEFAULT '',
        "suitable_for" jsonb NOT NULL DEFAULT '[]'::jsonb
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "pot_luck_rsvps" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "potluck_id" uuid NOT NULL REFERENCES "pot_lucks"("id") ON DELETE CASCADE,
        "user_id" uuid NOT NULL REFERENCES "user_accounts"("id") ON DELETE CASCADE,
        "status" varchar(20) NOT NULL CHECK ("status" IN ('attending', 'maybe', 'not-going')),
        CONSTRAINT "UQ_pot_luck_rsvps_event_user" UNIQUE ("potluck_id", "user_id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "photos" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "owner_user_id" uuid NOT NULL REFERENCES "user_accounts"("id") ON DELETE CASCADE,
        "content_type" varchar(40) NOT NULL CHECK ("content_type" IN ('image/png', 'image/jpeg', 'image/gif', 'image/webp')),
        "data" bytea NOT NULL
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "auth_sessions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "jti" uuid NOT NULL UNIQUE,
        "user_id" uuid NOT NULL REFERENCES "user_accounts"("id") ON DELETE CASCADE,
        "expires_at" timestamptz NOT NULL,
        "revoked_at" timestamptz
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_pot_lucks_organiser_user_id" ON "pot_lucks" ("organiser_user_id")');
    await queryRunner.query('CREATE INDEX "IDX_pot_lucks_featured" ON "pot_lucks" ("featured")');
    await queryRunner.query('CREATE INDEX "IDX_dishes_potluck_id" ON "dishes" ("potluck_id")');
    await queryRunner.query('CREATE INDEX "IDX_dishes_brought_by_user_id" ON "dishes" ("brought_by_user_id")');
    await queryRunner.query('CREATE INDEX "IDX_rsvp_potluck_id" ON "pot_luck_rsvps" ("potluck_id")');
    await queryRunner.query('CREATE INDEX "IDX_rsvp_user_id" ON "pot_luck_rsvps" ("user_id")');
    await queryRunner.query('CREATE INDEX "IDX_photos_owner_user_id" ON "photos" ("owner_user_id")');
    await queryRunner.query('CREATE INDEX "IDX_auth_sessions_user_id" ON "auth_sessions" ("user_id")');
    await queryRunner.query(`
      INSERT INTO "pot_lucks"
        ("id", "title", "starts_on", "start_time", "location", "organiser", "description", "image_url", "image_alt", "featured")
      VALUES
        ('a0000000-0000-4000-8000-000000000001', 'Office pot-luck', '2026-10-29', '12:00', 'L2 Kitchen', 'Jordan Lee', 'Don''t forget to bring your favorite dish!', 'https://images.caxton.co.za/wp-content/uploads/sites/85/2023/05/LNN-Featured-Image_1-5-3.png', 'A shared table of food', true),
        ('a0000000-0000-4000-8000-000000000002', 'Office Pot-luck', '2026-11-12', '12:00', 'L2 Kitchen', 'Ava Patel', 'Bring your favorite dish to share.', null, null, false),
        ('a0000000-0000-4000-8000-000000000003', 'Design Team Lunch', '2026-11-13', '12:30', 'Creative Studio', 'Mila Nguyen', 'Share a bright midday spread and a few new ideas.', null, null, false),
        ('a0000000-0000-4000-8000-000000000004', 'Team Brunch Bash', '2026-11-21', '10:00', 'Rooftop Terrace', 'Theo James', 'Brunch favorites, coffee, and plenty of conversation.', null, null, false),
        ('a0000000-0000-4000-8000-000000000005', 'Harvest Pot-luck', '2026-11-25', '18:00', 'Garden Courtyard', 'Priya Shah', 'Seasonal dishes and cozy sharing for the whole team.', null, null, false)
    `);
    await queryRunner.query(`
      INSERT INTO "dishes" ("id", "potluck_id", "name", "description", "photo_url", "prep_notes", "suitable_for")
      VALUES
        ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Roasted Vegetable Pasta Salad', 'A colorful seasonal pasta salad with peppers, olives, and herbs.', '/images/pasta-salad.svg', 'Best made the night before and tossed with extra dressing before serving.', '["Vegetarian", "Dairy-Free", "Nut-Free", "Gluten-Free"]'),
        ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Lemon Herb Quinoa Bowl', 'Light and fresh with citrus, herbs, and crunchy vegetables.', null, 'Serve chilled with a side of feta for anyone who wants it.', '["Vegan", "Gluten-Free", "Diabetic", "Soy-Free"]'),
        ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Chocolate Chickpea Brownies', 'A rich dessert with a slightly nutty finish and deep cocoa flavor.', '/images/brownies.svg', 'Top with berries for a lighter finish if you like.', '["Vegetarian", "Keto"]')
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "auth_sessions"');
    await queryRunner.query('DROP TABLE "photos"');
    await queryRunner.query('DROP TABLE "pot_luck_rsvps"');
    await queryRunner.query('DROP TABLE "dishes"');
    await queryRunner.query('DROP TABLE "pot_lucks"');
    await queryRunner.query('DROP TABLE "user_accounts"');
  }
}
