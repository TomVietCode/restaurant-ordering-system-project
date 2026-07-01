// ─────────────────────────────────────────────────────────────────────────────
// TYPES, ENUMS & MOCK DATA — Staff Management (US-06)
// Single source of truth được import bởi tất cả component trong feature này.
// Khớp 100% với cấu trúc bảng USER trong database.md
// ─────────────────────────────────────────────────────────────────────────────

export enum UserRole {
  OWNER = 'OWNER',
  STAFF = 'STAFF',
}

// Trạng thái lọc trong thanh FilterBar (không phải trường DB)
export type StatusFilter = 'all' | 'active' | 'inactive';

export interface IUser {
  id: number;
  email: string;
  // NOTE: password_hash không bao giờ được trả về từ API — chỉ dùng khi tạo mới
  role: UserRole;
  fullName: string;
  phone: string | null;
  isActive: boolean;
}

// Lỗi validate của form thêm nhân viên
export interface IFormErrors {
  fullName?: string;
  email?: string;
  password?: string;
}

// Giá trị mặc định của form thêm nhân viên
export interface IAddStaffForm {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// 4 nhân viên hiển thị trong thiết kế — dữ liệu khớp 100% với database.md
// Tổng 12 nhân viên (8 ẩn) để demo phân trang
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_STAFF_LIST: IUser[] = [
  {
    id: 1,
    email: 'nva@cafe.vn',
    role: UserRole.OWNER,
    fullName: 'Nguyễn Văn A',
    phone: null,
    isActive: true,
  },
  {
    id: 2,
    email: 'ttb@cafe.vn',
    role: UserRole.STAFF,
    fullName: 'Trần Thị B',
    phone: '0901234567',
    isActive: true,
  },
  {
    id: 3,
    email: 'lvc@cafe.vn',
    role: UserRole.STAFF,
    fullName: 'Lê Văn C',
    phone: null,
    isActive: false,
  },
  {
    id: 4,
    email: 'ptd@cafe.vn',
    role: UserRole.STAFF,
    fullName: 'Phạm Thị D',
    phone: '0912345678',
    isActive: true,
  },
  {
    id: 5,
    email: 'hte@cafe.vn',
    role: UserRole.STAFF,
    fullName: 'Hoàng Thị E',
    phone: null,
    isActive: true,
  },
  {
    id: 6,
    email: 'nvf@cafe.vn',
    role: UserRole.STAFF,
    fullName: 'Ngô Văn F',
    phone: '0934567890',
    isActive: false,
  },
  {
    id: 7,
    email: 'dtg@cafe.vn',
    role: UserRole.STAFF,
    fullName: 'Đặng Thị G',
    phone: null,
    isActive: true,
  },
  {
    id: 8,
    email: 'bvh@cafe.vn',
    role: UserRole.STAFF,
    fullName: 'Bùi Văn H',
    phone: '0945678901',
    isActive: true,
  },
  {
    id: 9,
    email: 'pti@cafe.vn',
    role: UserRole.STAFF,
    fullName: 'Phan Thị I',
    phone: null,
    isActive: true,
  },
  {
    id: 10,
    email: 'lvj@cafe.vn',
    role: UserRole.STAFF,
    fullName: 'Lý Văn J',
    phone: '0956789012',
    isActive: false,
  },
  {
    id: 11,
    email: 'ttk@cafe.vn',
    role: UserRole.STAFF,
    fullName: 'Trương Thị K',
    phone: null,
    isActive: true,
  },
  {
    id: 12,
    email: 'nvl@cafe.vn',
    role: UserRole.STAFF,
    fullName: 'Nguyễn Văn L',
    phone: '0967890123',
    isActive: true,
  },
];

// Số nhân viên hiển thị mỗi trang (cấu hình bởi nhóm trưởng: 7 dòng/trang)
export const PAGE_SIZE = 7;

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: tạo chữ viết tắt Avatar từ họ tên (VD: "Nguyễn Văn A" → "NA")
// ─────────────────────────────────────────────────────────────────────────────
export function getAvatarInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  // Lấy chữ cái đầu của từ đầu tiên và từ cuối cùng
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}
