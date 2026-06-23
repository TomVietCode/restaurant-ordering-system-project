import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'int', nullable: true })
  capacity: number | null;
  
  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable: boolean;
}
