import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../screens/cart_screen.dart';

class CustomBottomNav extends StatelessWidget {
  const CustomBottomNav({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE2DBD2), width: 1)),
      ),
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem('Thực đơn', Icons.menu_book, true),
          _buildNavItem('Tìm kiếm', Icons.search, false),
          _buildNavItem('Lịch sử', Icons.history, false),
          _buildCartItem(context, 'Giỏ hàng', 2),
        ],
      ),
    );
  }

  Widget _buildNavItem(String label, IconData icon, bool isActive) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          color: isActive ? AppColors.primaryDark : AppColors.textSecondary,
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: isActive ? AppTextStyles.bottomNavActive : AppTextStyles.bottomNavInactive,
        ),
      ],
    );
  }

  Widget _buildCartItem(BuildContext context, String label, int cartCount) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const CartScreen()),
        );
      },
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              const Icon(Icons.shopping_cart_outlined, color: AppColors.textSecondary),
              if (cartCount > 0)
                Positioned(
                  right: -6,
                  top: -4,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      cartCount.toString(),
                      style: AppTextStyles.cartBadge,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Giỏ hàng',
            style: AppTextStyles.bottomNavInactive,
          ),
        ],
      ),
    );
  }
}
