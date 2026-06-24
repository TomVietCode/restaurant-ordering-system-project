import 'package:flutter/material.dart';
import '../models/category_model.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

class CategoryTabs extends StatefulWidget {
  final List<CategoryModel> categories;
  
  const CategoryTabs({super.key, required this.categories});

  @override
  State<CategoryTabs> createState() => _CategoryTabsState();
}

class _CategoryTabsState extends State<CategoryTabs> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 40,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: widget.categories.length,
        separatorBuilder: (context, index) => const SizedBox(width: 24),
        itemBuilder: (context, index) {
          final isSelected = index == _selectedIndex;
          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedIndex = index;
              });
            },
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.categories[index].name,
                  style: isSelected ? AppTextStyles.tabActive : AppTextStyles.tabInactive,
                ),
                if (isSelected)
                  Container(
                    margin: const EdgeInsets.only(top: 4),
                    height: 2,
                    width: 20,
                    color: AppColors.primary,
                  )
              ],
            ),
          );
        },
      ),
    );
  }
}
