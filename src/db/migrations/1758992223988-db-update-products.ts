import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdateProducts1758992223988 implements MigrationInterface {
  name = 'DbUpdateProducts1758992223988';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "externalId" character varying(64) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "isDeleted" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_products_external_id" ON "products" ("externalId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c9fb58de893725258746385e1" ON "products" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c3932231d2385ac248d0888d95" ON "products" ("category") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_75895eeb1903f8a17816dafe0a" ON "products" ("price") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3b7a6bf7cc64d8bc8ebdb4c1f5" ON "products" ("isDeleted") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9f4fbf795d82b7b8aa2b1fc6e2" ON "products" ("isDeleted", "price") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9f4fbf795d82b7b8aa2b1fc6e2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3b7a6bf7cc64d8bc8ebdb4c1f5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_75895eeb1903f8a17816dafe0a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c3932231d2385ac248d0888d95"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4c9fb58de893725258746385e1"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_products_external_id"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "isDeleted"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "externalId"`);
  }
}
