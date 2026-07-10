import 'package:flutter/foundation.dart' show debugPrint;

import '../../core/constants/app_strings.dart';
import '../../core/network/dio_client.dart';
import '../../core/network/websocket_client.dart';
import '../models/category.dart';
import '../models/product.dart';

class MenuRepository {
  final DioClient _client;
  final WebSocketClient _wsClient;

  MenuRepository({DioClient? client, WebSocketClient? wsClient})
    : _client = client ?? DioClient(),
      _wsClient = wsClient ?? WebSocketClient();

  Stream<Map<String, dynamic>> get menuUpdatesStream => _wsClient.stream;

  Future<List<Category>> getCategories() async {
    try {
      final response = await _client.dio.get('/categories');
      final data = response.data;
      final categories = data is Map ? data['data'] : null;

      if (categories is List) {
        return categories
            .map((json) => Category.fromJson(_categoryJson(json)))
            .toList();
      }

      throw const FormatException('Invalid categories response');
    } catch (e) {
      debugPrint('Error fetching categories: $e');
      throw Exception(AppStrings.categoriesLoadFailed);
    }
  }

  Future<List<Product>> getProducts() async {
    try {
      final response = await _client.dio.get(
        '/customer/items',
        queryParameters: {'limit': 100},
      );
      final data = response.data;
      final products = data is Map && data['data'] is Map
          ? (data['data'] as Map)['items']
          : null;

      if (products is List) {
        return products
            .where(_hasCategory)
            .map((json) => Product.fromJson(_productJson(json)))
            .toList();
      }

      throw const FormatException('Invalid products response');
    } catch (e) {
      debugPrint('Error fetching products: $e');
      throw Exception(AppStrings.menuLoadFailed);
    }
  }

  Map<String, dynamic> _categoryJson(dynamic json) {
    final map = Map<String, dynamic>.from(json as Map);
    return {
      'category_id': map['id'],
      'name': map['name'],
      'description': map['description'],
    };
  }

  bool _hasCategory(dynamic json) {
    final map = Map<String, dynamic>.from(json as Map);
    return map['categoryId'] is num;
  }

  Map<String, dynamic> _productJson(dynamic json) {
    final map = Map<String, dynamic>.from(json as Map);
    return {
      'item_id': map['id'],
      'name': map['name'],
      'category_id': map['categoryId'],
      'price': double.tryParse(map['price'].toString()) ?? 0,
      'is_remain': map['isRemain'],
      'images_url': map['imagesUrl'] ?? [],
      'description': map['description'],
    };
  }
}
