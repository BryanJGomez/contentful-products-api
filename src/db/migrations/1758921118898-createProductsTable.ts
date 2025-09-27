import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsTable1758921118898 implements MigrationInterface {
  name = 'CreateProductsTable1758921118898';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sku" character varying(20) NOT NULL, "name" character varying(100) NOT NULL, "brand" character varying(50) NOT NULL, "model" character varying(100) NOT NULL, "category" character varying(50) NOT NULL, "color" character varying(50) NOT NULL, "price" numeric(12,2) NOT NULL, "currency" character varying(3) NOT NULL, "stock" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE ("sku"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "products"`);
  }
}
