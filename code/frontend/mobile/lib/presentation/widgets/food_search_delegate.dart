import 'package:flutter/material.dart';

import '../../core/constants/app_strings.dart';
import '../../core/utils/currency_formatter.dart';
import '../../data/models/product.dart';
import 'food_image.dart';
import 'product_detail_sheet.dart';

class FoodSearchDelegate extends SearchDelegate<Product?> {
  final List<Product> products;

  FoodSearchDelegate({required this.products})
    : super(searchFieldLabel: AppStrings.searchFoodHint);

  @override
  List<Widget>? buildActions(BuildContext context) {
    return [
      if (query.isNotEmpty)
        IconButton(
          icon: const Icon(Icons.clear),
          onPressed: () {
            query = '';
            showSuggestions(context);
          },
        ),
    ];
  }

  @override
  Widget? buildLeading(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.arrow_back),
      onPressed: () => close(context, null),
    );
  }

  @override
  Widget buildResults(BuildContext context) => _buildSearchResults();

  @override
  Widget buildSuggestions(BuildContext context) => _buildSearchResults();

  Widget _buildSearchResults() {
    final normalizedQuery = query.trim().toLowerCase();
    final results = products
        .where(
          (product) => product.name.toLowerCase().contains(normalizedQuery),
        )
        .toList();

    if (results.isEmpty) {
      return const Center(child: Text(AppStrings.noFoodFound));
    }

    return ListView.builder(
      itemCount: results.length,
      itemBuilder: (context, index) {
        final product = results[index];

        return ListTile(
          onTap: () => showProductDetailSheet(context, product),
          leading: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: FoodImage(
              imageUrls: product.imagesUrl,
              width: 50,
              height: 50,
            ),
          ),
          title: Text(
            product.name,
            style: TextStyle(
              color: product.isRemain ? Colors.black : Colors.grey,
              decoration: product.isRemain ? null : TextDecoration.lineThrough,
            ),
          ),
          subtitle: Text(
            product.price.toVND(),
            style: const TextStyle(
              color: Color(0xFF9A442D),
              fontWeight: FontWeight.bold,
            ),
          ),
          trailing: product.isRemain
              ? IconButton(
                  icon: const Icon(Icons.add_circle, color: Color(0xFF9A442D)),
                  onPressed: () => showProductDetailSheet(context, product),
                )
              : const Text(
                  AppStrings.outOfStockShort,
                  style: TextStyle(color: Colors.red),
                ),
        );
      },
    );
  }
}
