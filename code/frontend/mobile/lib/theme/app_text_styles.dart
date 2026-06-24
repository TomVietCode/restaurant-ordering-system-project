import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTextStyles {
  // ----- TITLE & HEADING -----
  
  // Tên món ăn (Ví dụ: Phở Bò Đặc Biệt), Tên bàn (Bàn 05)
  static const TextStyle title = TextStyle(
    fontFamily: 'Epilogue',
    fontSize: 18,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
    height: 1.33,
  );

  // Giá tiền (Ví dụ: 125.000₫)
  static const TextStyle price = TextStyle(
    fontFamily: 'Epilogue',
    fontSize: 24,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
    height: 1.33,
  );

  // ----- BODY & DESCRIPTION -----

  // Mô tả món ăn, Hint text tìm kiếm
  static const TextStyle body = TextStyle(
    fontFamily: 'Epilogue',
    fontSize: 15,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
    height: 1.47,
  );

  // ----- LABELS & BADGES -----

  // Nhãn BESTSELLER
  static const TextStyle badgeLabel = TextStyle(
    fontFamily: 'Epilogue',
    fontSize: 14,
    fontWeight: FontWeight.w700,
    color: AppColors.primary,
    height: 1.29,
  );

  // Badge số lượng giỏ hàng (Ví dụ: '2')
  static const TextStyle cartBadge = TextStyle(
    fontFamily: 'Nimbus Sans',
    fontSize: 10,
    fontWeight: FontWeight.w700,
    color: AppColors.white,
    height: 1.50,
  );

  // ----- TABS & BOTTOM NAVIGATION -----

  // Tab đang được chọn (Món chính)
  static const TextStyle tabActive = TextStyle(
    fontFamily: 'Epilogue',
    fontSize: 15,
    fontWeight: FontWeight.w700,
    color: AppColors.primary,
    height: 1.33,
  );

  // Tab không được chọn (Khai vị, Đồ uống...)
  static const TextStyle tabInactive = TextStyle(
    fontFamily: 'Epilogue',
    fontSize: 15,
    fontWeight: FontWeight.w700,
    color: AppColors.textSecondary,
    height: 1.33,
  );

  // Bottom Nav đang được chọn (Thực đơn)
  static const TextStyle bottomNavActive = TextStyle(
    fontFamily: 'Epilogue',
    fontSize: 15,
    fontWeight: FontWeight.w700,
    color: AppColors.primaryDark,
    height: 1.33,
  );

  // Bottom Nav không được chọn (Tìm kiếm, Lịch sử, Giỏ hàng)
  static const TextStyle bottomNavInactive = TextStyle(
    fontFamily: 'Epilogue',
    fontSize: 15,
    fontWeight: FontWeight.w700,
    color: AppColors.textSecondary,
    height: 1.33,
  );
}
