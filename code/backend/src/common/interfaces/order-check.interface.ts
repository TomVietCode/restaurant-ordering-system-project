export interface IOrderCheckService {
  hasActiveOrders(tableId: string): Promise<boolean>
}