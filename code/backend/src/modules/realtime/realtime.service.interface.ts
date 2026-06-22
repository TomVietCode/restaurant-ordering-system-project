/**
 * Abstraction for realtime event broadcasting.
 * Any module can inject this to push events to connected clients.
 *
 * Events follow the naming convention: `{domain}:{action}`
 * Examples:
 *   - 'menu:item-availability-changed'  (item toggled in/out of stock)
 *   - 'order:new'                       (new order placed)
 *   - 'order:status-changed'            (order status updated)
 */
export interface IRealtimeService {
  /**
   * Broadcast an event to ALL connected Socket.IO clients.
   *
   * @param event - Event name following '{domain}:{action}' convention
   * @param payload - JSON-serializable data to send
   */
  emit<T>(event: string, payload: T): void;
}
