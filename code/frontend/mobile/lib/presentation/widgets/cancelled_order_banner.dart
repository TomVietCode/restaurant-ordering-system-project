import 'package:flutter/material.dart';

import '../../core/constants/app_strings.dart';

class CancelledOrderBanner extends StatelessWidget {
  const CancelledOrderBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFEBEB),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red.shade200),
      ),
      child: const Row(
        children: [
          Icon(Icons.cancel, color: Colors.red, size: 28),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  AppStrings.orderCancelled,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.red,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  AppStrings.contactStaffForSupport,
                  style: TextStyle(fontSize: 13, color: Colors.red),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
