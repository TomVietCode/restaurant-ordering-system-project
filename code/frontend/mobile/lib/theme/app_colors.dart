import 'package:flutter/material.dart';

class AppColors {
  // Màu chính của app (Đỏ gạch / Cam cháy) dùng cho Bestseller, Active Tab, Tên bàn
  static const Color primary = Color(0xFF9A442D);
  
  // Màu đậm hơn của primary, dùng cho Bottom Nav Item đang active ('Thực đơn')
  static const Color primaryDark = Color(0xFF5B1604);

  // Màu chữ chính (Đen/Nâu cực đậm) dùng cho Tên món, Giá tiền
  static const Color textPrimary = Color(0xFF201B16);

  // Màu chữ phụ (Nâu xám) dùng cho Mô tả món, Tìm kiếm, Inactive Tab, Inactive Bottom Nav
  static const Color textSecondary = Color(0xFF55423E);

  // Màu trắng dùng cho text bên trong Badge giỏ hàng
  static const Color white = Colors.white;
}
