import 'package:flutter/material.dart';
import '../repositories/mock_data.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/search_bar_widget.dart';
import '../widgets/category_tabs.dart';
import '../widgets/food_item_card.dart';
import '../widgets/custom_bottom_nav.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Row(
          children: [
            Text('Bàn 05', style: AppTextStyles.title),
            Spacer(),
            Icon(Icons.notifications_none, color: AppColors.textPrimary),
          ],
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            const Padding(
              padding: EdgeInsets.fromLTRB(16, 8, 16, 16),
              child: SearchBarWidget(),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: CategoryTabs(categories: MockData.categories),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                itemCount: MockData.menuItems.length,
                separatorBuilder: (context, index) => const SizedBox(height: 16),
                itemBuilder: (context, index) {
                  final item = MockData.menuItems[index];
                  // Đặt món đầu tiên làm BESTSELLER làm ví dụ
                  final isBestseller = index == 0;
                  return FoodItemCard(item: item, isBestseller: isBestseller);
                },
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: const CustomBottomNav(),
    );
  }
}
