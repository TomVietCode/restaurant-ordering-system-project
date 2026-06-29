import '../models/category.dart';
import '../models/product.dart';

import '../../core/network/dio_client.dart';

import '../../core/network/dio_client.dart';

class MenuRepository {
  Future<List<Category>> getCategories() async {
    try {
<<<<<<< Updated upstream
      final response = await DioClient().dio.get('/menu');
      final data = response.data['categories'] as List;
      return data.map((json) => Category.fromJson(json)).toList();
    } catch (e) {
      print('Error fetching categories: $e');
      // Trả về mock data nếu lỗi kết nối để app không crash
      return mockCategories;
=======
      final response = await DioClient().dio.get('/categories');
      final data = response.data['data'] as List;
      return data.map((json) => Category.fromJson(_categoryJson(json))).toList();
    } catch (e) {
      print('Error fetching categories: $e');
      // Trả về mock data nếu lỗi kết nối để app không crash
      rethrow;
>>>>>>> Stashed changes
    }
  }

  Future<List<Product>> getProducts() async {
    try {
<<<<<<< Updated upstream
      final response = await DioClient().dio.get('/menu');
      final data = response.data['products'] as List;
      return data.map((json) => Product.fromJson(json)).toList();
    } catch (e) {
      print('Error fetching products: $e');
      return mockProducts;
    }
=======
      final response = await DioClient().dio.get('/customer/items', queryParameters: {'limit': 100});
      final data = response.data['data']['items'] as List;
      return data.map((json) => Product.fromJson(_productJson(json))).toList();
    } catch (e) {
      print('Error fetching products: $e');
      rethrow;
    }
  }

  Map<String, dynamic> _categoryJson(dynamic json) {
    final map = json as Map<String, dynamic>;
    return {
      'category_id': map['id'],
      'name': map['name'],
      'description': map['description'],
    };
  }

  Map<String, dynamic> _productJson(dynamic json) {
    final map = json as Map<String, dynamic>;
    return {
      'item_id': map['id'],
      'name': map['name'],
      'category_id': map['categoryId'],
      'price': double.tryParse(map['price'].toString()) ?? 0,
      'is_remain': map['isRemain'],
      'images_url': map['imagesUrl'] ?? [],
      'description': map['description'],
    };
>>>>>>> Stashed changes
  }
}
