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
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  if (!raw) return fallback;
  for (const r of RULES) if (r.test.test(raw)) return r.vi;
  if (HAS_VIETNAMESE.test(raw)) return raw;
  return fallback;
}
