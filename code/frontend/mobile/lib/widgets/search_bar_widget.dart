import 'package:flutter/material.dart';
import '../theme/app_text_styles.dart';

class SearchBarWidget extends StatelessWidget {
  const SearchBarWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF1E9), // Từ template
        border: Border.all(color: const Color(0xFFE2DBD2), width: 1),
        borderRadius: BorderRadius.circular(9999),
      ),
      child: Row(
        children: [
          const Icon(Icons.search, color: Color(0xFF55423E)),
          const SizedBox(width: 12),
          Expanded(
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Tìm kiếm món ăn...',
                hintStyle: AppTextStyles.body,
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.zero,
              ),
              style: AppTextStyles.body.copyWith(color: Colors.black),
            ),
          ),
        ],
      ),
    );
  }
}
