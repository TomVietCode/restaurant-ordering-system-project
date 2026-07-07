import 'package:flutter/material.dart';

class OrderStatusTimeline extends StatelessWidget {
  final int activeStep;

  const OrderStatusTimeline({super.key, required this.activeStep});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Positioned(
            top: 20,
            left: 40,
            right: 40,
            child: Container(height: 2, color: Colors.grey[300]),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _TimelineStep(
                icon: Icons.receipt_long,
                label: 'Mới',
                backgroundColor: const Color(0xFFE3EFFF),
                iconColor: const Color(0xFF0056D2),
                isActive: activeStep == 0,
              ),
              _TimelineStep(
                icon: Icons.soup_kitchen,
                label: 'Đang\nchuẩn bị',
                backgroundColor: const Color(0xFFFFF2D1),
                iconColor: const Color(0xFFA15C00),
                isActive: activeStep == 1,
              ),
              _TimelineStep(
                icon: Icons.room_service,
                label: 'Đã phục vụ',
                backgroundColor: const Color(0xFFEFE5FF),
                iconColor: const Color(0xFF551FFF),
                isActive: activeStep == 2,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _TimelineStep extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color backgroundColor;
  final Color iconColor;
  final bool isActive;

  const _TimelineStep({
    required this.icon,
    required this.label,
    required this.backgroundColor,
    required this.iconColor,
    required this.isActive,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: backgroundColor,
            borderRadius: BorderRadius.circular(12),
            border: isActive ? Border.all(color: iconColor, width: 2) : null,
          ),
          child: Icon(icon, color: iconColor),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: iconColor,
          ),
        ),
      ],
    );
  }
}
