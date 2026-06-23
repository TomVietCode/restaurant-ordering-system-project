import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Order } from './order.entity.js';
import { Item } from '@modules/items/entities/item.entity.js';

/**
 * Junction table linking an order to its menu items.
 * Uses a composite primary key (order_id, item_id) — an item
 * can appear only once per order (increase quantity instead).
 */
@Entity('order_items')
export class OrderItem {
  @PrimaryColumn({ name: 'order_id' })
  orderId: number;

  @PrimaryColumn({ name: 'item_id' })
  itemId: number;

  @Column({ type: 'int' })
  quantity: number;

  /**
   * Price snapshot taken at the moment the order was placed.
   * Immune to future price changes on the menu item.
   */
  @Column({ name: 'price_at_order', type: 'decimal', precision: 10, scale: 2 })
  priceAtOrder: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string | null;

  // ── Relations ──

  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Item, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'item_id' })
  item: Item;
}
