// Staff Management page — US-06 (FR-09)
// Toàn bộ logic và UI đã được tách vào:
//   src/components/features/staffs/StaffBoard.tsx     ← state container
//   src/components/features/staffs/StaffTable.tsx     ← filter bar + table + pagination
//   src/components/features/staffs/StaffFormModal.tsx ← modal thêm mới & chỉnh sửa
//   src/components/features/staffs/StaffConfirmDelete.tsx ← dialog xác nhận xóa
//   src/components/features/staffs/types.ts           ← types, enums, mock data

import { StaffBoard } from '@/components/features/staffs/StaffBoard';

export default function StaffPage() {
  return <StaffBoard />;
}
