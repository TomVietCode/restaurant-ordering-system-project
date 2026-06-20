import type { ITableRepository } from '@modules/tables/repositories/table.repository.interface';
import { InjectionToken } from '@nestjs/common';
import type { IOrderCheckService } from './interfaces/order-check.interface';

export const TABLE_REPO_TOKEN: InjectionToken<ITableRepository> = Symbol('ITableRepository');
export const ORDER_CHECK_SERVICE_TOKEN: InjectionToken<IOrderCheckService> = Symbol('IOrderCheckService');
