import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { TableStatus } from '@common/enums.js';

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'int', nullable: false })
  capacity: number;
  
  @Column({
    type: 'enum',
    enum: TableStatus,
    default: TableStatus.AVAILABLE,
  })
  status: TableStatus;
}

