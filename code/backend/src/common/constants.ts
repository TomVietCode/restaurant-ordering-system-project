import type { ITableRepository } from '@modules/tables/repositories/table.repository.interface';
import { InjectionToken } from '@nestjs/common';
import type { IOrderCheckService } from '@common/interfaces/order-check.interface';
import type { IItemRepository } from '@modules/items/repositories/item.repo.interface';
import type { IRealtimeService } from '@modules/realtime/realtime.service.interface';
import type { IOrderRepository } from '@modules/orders/repositories/order.repository.interface';
import type { IResetPasswordTokenRepository } from '@modules/auth/repositories/reset-password-token.repository.interface';
import { IReportRepository } from '@modules/reports/repositories/report.repository.interface';

export const TABLE_REPO_TOKEN: InjectionToken<ITableRepository> = Symbol('ITableRepository');
export const ORDER_CHECK_SERVICE_TOKEN: InjectionToken<IOrderCheckService> = Symbol('IOrderCheckService');
export const ITEM_REPOSITORY_TOKEN: InjectionToken<IItemRepository> = Symbol('IItemRepository');
export const REALTIME_SERVICE_TOKEN: InjectionToken<IRealtimeService> = Symbol('IRealtimeService');
export const ORDER_REPO_TOKEN: InjectionToken<IOrderRepository> = Symbol('IOrderRepository');
export const RESET_PASSWORD_TOKEN_REPOSITORY_TOKEN: InjectionToken<IResetPasswordTokenRepository> = Symbol('IResetPasswordTokenRepository');
export const REPORT_REPOSITORY: InjectionToken<IReportRepository> = Symbol('REPORT_REPOSITORY');
