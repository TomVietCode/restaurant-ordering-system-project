import 'package:flutter/material.dart';
import '../models/item_model.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../screens/item_detail_screen.dart';

class FoodItemCard extends StatelessWidget {
  final ItemModel item;
  final bool isBestseller;

  const FoodItemCard({super.key, required this.item, this.isBestseller = false});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        if (item.isRemain) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => ItemDetailScreen(item: item)),
          );
        }
      },
      child: Opacity(
        opacity: item.isRemain ? 1.0 : 0.5,
        child: Container(
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2DBD2), width: 1),
            boxShadow: const [
              BoxShadow(
                color: Color(0x0C000000),
                blurRadius: 2,
                offset: Offset(0, 1),
              )
            ],
          ),
          child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image Section
          Container(
            width: double.infinity,
            height: 192,
            decoration: const BoxDecoration(color: Color(0xFFFEF1E9)),
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.network(
                  item.imagesUrl.isNotEmpty ? item.imagesUrl.first : "https://placehold.co/308x192",
                  fit: BoxFit.cover,
                ),
                if (isBestseller)
                  Positioned(
                    left: 12,
                    top: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.9),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text('BESTSELLER', style: AppTextStyles.badgeLabel),
                    ),
                  ),
              ],
            ),
          ),
          // Content Section
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.name, style: AppTextStyles.title),
                const SizedBox(height: 8),
                Text(
                  item.description ?? '',
                  style: AppTextStyles.body,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${item.price.toInt()}₫', // Đơn giản hóa format giá
                      style: AppTextStyles.price,
                    ),
                    Container(
                      width: 40,
                      height: 40,
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Color(0x0C000000),
                            blurRadius: 2,
                            offset: Offset(0, 1),
                          )
                        ],
                      ),
                      child: const Icon(Icons.add, color: Colors.white),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    )));
  }
}
