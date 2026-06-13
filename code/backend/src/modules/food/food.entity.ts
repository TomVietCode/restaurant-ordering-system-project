import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Food {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    name?: string;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    price?: number;
}
