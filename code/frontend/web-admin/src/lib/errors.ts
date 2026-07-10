import { ApiError } from '@/lib/api';

const ERROR_CODE_MAP: Record<string, string> = {
  // Auth
  INVALID_CREDENTIALS: 'Sai email hoặc mật khẩu.',
  REFRESH_TOKEN_INVALID: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
  REFRESH_TOKEN_REVOKED: 'Phiên đăng nhập đã bị thu hồi. Vui lòng đăng nhập lại.',
  REFRESH_TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  ACCOUNT_INACTIVE: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.',
  OTP_INVALID: 'Mã OTP không đúng. Vui lòng kiểm tra lại.',
  OTP_EXPIRED: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.',
  OLD_PASSWORD_INVALID: 'Mật khẩu cũ không đúng.',
  SAME_PASSWORD: 'Mật khẩu mới không được trùng với mật khẩu cũ.',
  EMAIL_NOT_FOUND: 'Email chưa được đăng ký trong hệ thống.',

  // Users / Staffs
  USER_NOT_FOUND: 'Nhân viên không tồn tại hoặc đã bị xóa.',
  EMAIL_ALREADY_EXISTS: 'Email đã được sử dụng. Vui lòng chọn email khác.',
  PHONE_ALREADY_EXISTS: 'Số điện thoại đã được sử dụng. Vui lòng chọn số khác.',
  CANNOT_DELETE_ACTIVE_USER: 'Không thể xóa: hãy khóa tài khoản trước khi xóa.',
  CANNOT_DEACTIVATE_SELF: 'Bạn không thể tự khóa tài khoản của chính mình.',
  CANNOT_CHANGE_OWN_ROLE: 'Bạn không thể tự thay đổi vai trò của chính mình.',

  // Categories
  CATEGORY_NOT_FOUND: 'Danh mục không tồn tại hoặc đã bị xóa.',
  CATEGORY_NAME_ALREADY_EXISTS: 'Tên danh mục đã tồn tại. Vui lòng chọn tên khác.',
  CATEGORY_HAS_ITEMS: 'Không thể xóa: vẫn còn món ăn thuộc danh mục này.',

  // Items / Menu
  ITEM_NOT_FOUND: 'Món ăn không tồn tại hoặc đã bị xóa.',
  ITEM_OUT_OF_STOCK: 'Món ăn đã hết hàng. Vui lòng xóa khỏi giỏ hàng.',

  // Tables
  TABLE_NOT_FOUND: 'Bàn không tồn tại hoặc đã bị xóa.',
  TABLE_NAME_ALREADY_EXISTS: 'Tên bàn đã tồn tại. Vui lòng chọn tên khác.',
  TABLE_HAS_ACTIVE_ORDER: 'Bàn đang có đơn hàng. Vui lòng xử lý đơn trước.',
  TABLE_CLOSED: 'Bàn hiện chưa mở. Vui lòng liên hệ nhân viên.',

  // Orders
  ORDER_NOT_FOUND: 'Đơn hàng không tồn tại hoặc đã bị xóa.',
  INVALID_ORDER_STATUS_TRANSITION: 'Không thể chuyển trạng thái đơn hàng này.',
  PAYMENT_FAILED: 'Thanh toán thất bại. Vui lòng thử lại.',

  // Generic
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  NOT_FOUND: 'Không tìm thấy dữ liệu yêu cầu.',
  INTERNAL_SERVER_ERROR: 'Máy chủ gặp sự cố. Vui lòng thử lại sau.',
};

// Fallback theo regex cho message cũ chưa có errorCode (legacy) — giữ lại để tương thích ngược.
const RULES: { test: RegExp; vi: string }[] = [
  // Mạng / kết nối
  { test: /failed to fetch|networkerror|network request failed|fetch failed/i, vi: 'Không thể kết nối máy chủ. Kiểm tra mạng và thử lại.' },

  // Xác thực / phân quyền
  { test: /unauthorized|invalid token|jwt expired|jwt malformed|token/i, vi: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' },
  { test: /forbidden|not allowed|do not have permission|insufficient/i, vi: 'Bạn không có quyền thực hiện thao tác này.' },

  // Trùng tên
  { test: /email already exists|duplicate.*email/i, vi: 'Email đã được sử dụng. Vui lòng chọn email khác.' },
  { test: /phone already exists|duplicate.*phone/i, vi: 'Số điện thoại đã được sử dụng. Vui lòng chọn số khác.' },
  { test: /already exists/i, vi: 'Tên đã tồn tại! Vui lòng chọn tên khác.' },

  // Ràng buộc xóa
  { test: /items are linked|foreign key constraint|cannot delete category/i, vi: 'Không thể xóa: vẫn còn món ăn thuộc danh mục này. Hãy chuyển hoặc xóa các món trước.' },
  { test: /cannot delete an active user/i, vi: 'Không thể xóa: hãy khóa tài khoản này trước khi xóa.' },
  { test: /cannot deactivate your own account/i, vi: 'Bạn không thể tự khóa tài khoản của chính mình.' },

  // Không tìm thấy
  { test: /item not found/i, vi: 'Món ăn không tồn tại hoặc đã bị xóa.' },
  { test: /category not found/i, vi: 'Danh mục không tồn tại hoặc đã bị xóa.' },
  { test: /user not found/i, vi: 'Nhân viên không tồn tại hoặc đã bị xóa.' },
  { test: /not found/i, vi: 'Không tìm thấy dữ liệu yêu cầu.' },

  // Lỗi kiểm tra dữ liệu (class-validator)
  { test: /name is required|name should not be empty|name must be a string/i, vi: 'Tên không được để trống.' },
  { test: /name cannot exceed|name must be shorter/i, vi: 'Tên quá dài.' },
  { test: /price must be|price should not/i, vi: 'Giá phải là số lớn hơn hoặc bằng 0.' },
  { test: /category.?id/i, vi: 'Danh mục không hợp lệ. Vui lòng chọn lại.' },
  { test: /each image must be a valid url|images?_?url/i, vi: 'Đường dẫn ảnh không hợp lệ.' },
  { test: /description (cannot exceed|must be shorter)/i, vi: 'Mô tả quá dài.' },
  { test: /isremain must be/i, vi: 'Trạng thái còn hàng không hợp lệ.' },
  { test: /isremain should not exist/i, vi: 'Lọc theo trạng thái Còn/Hết hàng hiện chưa được máy chủ hỗ trợ.' },

  // Lỗi máy chủ
  { test: /internal server error|API 5\d\d/i, vi: 'Máy chủ gặp sự cố. Vui lòng thử lại sau.' },
];

// Có chứa ký tự tiếng Việt → coi như message đã là tiếng Việt, giữ nguyên.
const HAS_VIETNAMESE = /[àáâãèéêìíòóôõùúăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳýỵỷỹ]/i;

export function toViError(err: unknown, fallback = 'Không thể thực hiện hành động. Vui lòng thử lại.'): string {
  // 1. Tra theo errorCode (đáng tin cậy nhất)
  if (err instanceof ApiError && err.errorCode) {
    const mapped = ERROR_CODE_MAP[err.errorCode];
    if (mapped) return mapped;
  }

  // 2. Fallback regex cho message không có errorCode (legacy / bất ngờ)
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  if (!raw) return fallback;
  for (const r of RULES) if (r.test.test(raw)) return r.vi;

  // 3. Message đã là tiếng Việt → giữ nguyên
  if (HAS_VIETNAMESE.test(raw)) return raw;

  return fallback;
}
