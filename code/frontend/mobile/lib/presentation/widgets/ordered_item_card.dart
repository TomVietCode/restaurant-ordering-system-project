import 'package:flutter/material.dart';

import '../../core/constants/app_strings.dart';
import '../../core/utils/currency_formatter.dart';
import '../../data/models/order_item.dart';
import 'food_image.dart';

class OrderedItemCard extends StatelessWidget {
  final OrderItem item;
  final String fallbackOrderCode;

  const OrderedItemCard({
    super.key,
    required this.item,
    required this.fallbackOrderCode,
  });

  @override
  Widget build(BuildContext context) {
    final badgeStyle = _badgeStyleFor(item.status);
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade100),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: FoodImage(
              imageUrls: item.product.imagesUrl,
              width: 70,
              height: 70,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        item.product.name,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      (item.product.price * item.quantity).toVND(),
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        color: Colors.black87,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                if (item.notes != null && item.notes!.isNotEmpty) ...[
                  Text(
                    item.notes!,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Colors.redAccent,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                  const SizedBox(height: 4),
                ],
                Text(
                  AppStrings.itemQuantity(item.quantity),
                  style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                ),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: badgeStyle.backgroundColor,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        badgeStyle.icon,
                        color: badgeStyle.iconColor,
                        size: 16,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      AppStrings.orderCode(_displayOrderCode()),
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Colors.grey[500],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _displayOrderCode() {
    if (item.orderCode.trim().isNotEmpty) return item.orderCode.trim();
    return fallbackOrderCode.trim();
  }

  _OrderBadgeStyle _badgeStyleFor(OrderStatus status) {
    return switch (status) {
      OrderStatus.cancelled => const _OrderBadgeStyle(
        backgroundColor: Color(0xFFFFEBEB),
        iconColor: Colors.red,
        icon: Icons.cancel,
      ),
      OrderStatus.pending => const _OrderBadgeStyle(
        backgroundColor: Color(0xFFE3EFFF),
        iconColor: Color(0xFF0056D2),
        icon: Icons.receipt_long,
      ),
      OrderStatus.preparing => const _OrderBadgeStyle(
        backgroundColor: Color(0xFFFFF2D1),
        iconColor: Color(0xFFA15C00),
        icon: Icons.soup_kitchen,
      ),
      OrderStatus.served => const _OrderBadgeStyle(
        backgroundColor: Color(0xFFEFE5FF),
        iconColor: Color(0xFF551FFF),
        icon: Icons.room_service,
      ),
    };
  }
}

class _OrderBadgeStyle {
  final Color backgroundColor;
  final Color iconColor;
  final IconData icon;

  const _OrderBadgeStyle({
    required this.backgroundColor,
    required this.iconColor,
    required this.icon,
  });
}
