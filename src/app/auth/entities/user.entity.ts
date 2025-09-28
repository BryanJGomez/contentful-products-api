import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    select: false,
  })
  password: string;

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Column({ type: 'bool', default: true })
  isActive: boolean;
}
