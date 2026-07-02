'use client';

import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { OrderFilters } from './OrderFilters';
import { OrderDetailDialog } from './OrderDetailDialog';
import { getOrdersColumns } from './ordersColumns';
import { useOrders, ORDERS_PAGE } from './useOrders';

export function OrdersPage() {
  const o = useOrders();
  const columns = getOrdersColumns({ onView: o.onView });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Bảng đơn</h1>
      </div>

      <OrderFilters
        search={o.search} status={o.status} dateFilter={o.dateFilter}
        onSearch={o.onSearch} onStatusChange={o.onStatusChange} onDateChange={o.onDateChange}
      />

      {o.unauthenticated ? (
        <div className="rounded-xl border border-border bg-card py-12 text-center text-sm text-muted-foreground">
          Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để xem đơn hàng.
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={o.rows} loading={o.loading} emptyText="Không có đơn hàng nào" />
          <Pagination page={o.cur} pageSize={ORDERS_PAGE} total={o.total} unit="đơn" onPageChange={o.onPageChange} />
        </>
      )}

      <OrderDetailDialog
        order={o.detailTarget}
        loading={o.detailLoading}
        open={!!o.detailTarget}
        onOpenChange={v => { if (!v) o.setDetailTarget(null); }}
      />
    </div>
  );
}
