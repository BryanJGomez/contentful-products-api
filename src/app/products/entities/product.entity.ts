import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('products')
@Index(['isDeleted', 'price']) // Composite index for reports
export class Products {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_products_external_id', { unique: true })
  @Column('varchar', { length: 64 })
  externalId: string;

  @Column('varchar', { length: 20, unique: true })
  sku: string;

  @Index()
  @Column('varchar', { length: 100 })
  name: string;

  @Column('varchar', { length: 50 })
  brand: string;

  @Column('varchar', { length: 100 })
  model: string;

  @Index()
  @Column('varchar', { length: 50 })
  category: string;

  @Column('varchar', { length: 50 })
  color: string;

  @Index()
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price: number;

  @Column('varchar', { length: 3 })
  currency: string;

  @Column('int')
  stock: number;

  @Index()
  @Column('boolean', { default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
