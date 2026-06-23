import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderStatus, PaymentMethod } from '@common/enums.js';
import { Table } from '@modules/tables/table.entity.js';
import { OrderItem } from '@modules/orders/entities/order-item.entity.js';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'table_id', type: 'uuid' })
  tableId: string;

  /**
   * Secure random UUID exposed to customers for order tracking.
   * Never expose the internal integer `id` to customers.
   */
  @Column({ name: 'tracking_code', type: 'uuid', unique: true })
  trackingCode: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.NEW,
  })
  status: OrderStatus;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalAmount: number;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod | null;

  @Column({ name: 'cancel_reason', type: 'varchar', length: 255, nullable: true })
  cancelReason: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date | null;

  // ── Relations ──

  @ManyToOne(() => Table, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'table_id' })
  table: Table;

  @OneToMany(() => OrderItem, (oi) => oi.order, { cascade: true })
  orderItems: OrderItem[];
}
