import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowNullPriceInProducts1759029445123
  implements MigrationInterface
{
  name = 'AllowNullPriceInProducts1759029445123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9f4fbf795d82b7b8aa2b1fc6e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "price" DROP NOT NULL`,
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
      `ALTER TABLE "products" ALTER COLUMN "price" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9f4fbf795d82b7b8aa2b1fc6e2" ON "products" ("price", "isDeleted") `,
    );
  }
}
