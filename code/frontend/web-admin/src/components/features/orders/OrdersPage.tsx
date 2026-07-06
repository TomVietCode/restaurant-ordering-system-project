'use client';

import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { OrderFilters } from './OrderFilters';
import { OrderDetailDialog } from './OrderDetailDialog';
import { getOrdersColumns } from './ordersColumns';
import { useOrders } from './useOrders';

export function OrdersPage() {
  const o = useOrders();
  const columns = getOrdersColumns({ onView: o.onView });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Bảng đơn</h1>
      </div>

      <OrderFilters
        search={o.search} status={o.status} dateFilter={o.dateFilter} tableId={o.tableId} tables={o.tables} pageSize={o.pageSize}
        onSearch={o.onSearch} onStatusChange={o.onStatusChange} onDateChange={o.onDateChange} onTableChange={o.onTableChange}
        onPageSizeChange={o.onPageSizeChange}
      />

      {o.unauthenticated ? (
        <div className="rounded-xl border border-border bg-card py-12 text-center text-sm text-muted-foreground">
          Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để xem đơn hàng.
        </div>
      ) : (
        <>
          {/*
            Chỉ hiện "Đang tải…" (thay hẳn bảng) khi CHƯA có data nào (lần đầu vào trang).
            Từ lần fetch thứ 2 trở đi (đổi trang/lọc), giữ nguyên bảng cũ + làm mờ nhẹ
            thay vì chớp qua "Đang tải…" rồi lại hiện data — tránh hiệu ứng nháy.
          */}
          <div className={o.loading && o.rows.length > 0 ? 'opacity-60 transition-opacity' : undefined}>
            <DataTable columns={columns} data={o.rows} loading={o.loading && o.rows.length === 0} emptyText="Không có đơn hàng nào" />
          </div>
          <Pagination page={o.cur} pageSize={o.pageSize} total={o.total} unit="đơn" onPageChange={o.onPageChange} />
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
