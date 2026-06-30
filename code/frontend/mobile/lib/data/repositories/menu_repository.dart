import 'package:flutter/foundation.dart' show debugPrint;

import '../../core/network/dio_client.dart';
import '../datasources/mock_data.dart';
import '../models/category.dart';
import '../models/product.dart';

class MenuRepository {
  final DioClient _client;

  MenuRepository({DioClient? client}) : _client = client ?? DioClient();

  Future<List<Category>> getCategories() async {
    try {
      final response = await _client.dio.get('/menu');
      final data = response.data;
      final categories = data is Map ? data['categories'] : null;

      if (categories is List) {
        return categories
            .map(
              (json) =>
                  Category.fromJson(Map<String, dynamic>.from(json as Map)),
            )
            .toList();
      }
    } catch (e) {
      debugPrint('Error fetching categories: $e');
    }

    return mockCategories;
  }

  Future<List<Product>> getProducts() async {
    try {
      final response = await _client.dio.get('/menu');
      final data = response.data;
      final products = data is Map ? data['products'] : null;

      if (products is List) {
        return products
            .map(
              (json) =>
                  Product.fromJson(Map<String, dynamic>.from(json as Map)),
            )
            .toList();
      }
    } catch (e) {
      debugPrint('Error fetching products: $e');
    }

    return mockProducts;
  }
}
