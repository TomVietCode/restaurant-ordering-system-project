export enum Role {
  OWNER = 'OWNER',
  STAFF = 'STAFF',
}

export enum OrderStatus {
  NEW = 'NEW',
  PREPARING = 'PREPARING',
  SERVED = 'SERVED',
  PAID = 'PAID',
  CANCEL = 'CANCEL',
}

export enum PaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
}

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  CLOSED = 'CLOSED',
  OCCUPIED = 'OCCUPIED',
}

export enum PaymentMethod {
  VNPAY = 'VNPAY',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}