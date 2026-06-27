import '../models/category.dart';
import '../models/product.dart';
import '../datasources/mock_data.dart';

import '../../core/network/dio_client.dart';

class MenuRepository {
  Future<List<Category>> getCategories() async {
    try {
      final response = await DioClient().dio.get('/menu');
      final data = response.data['categories'] as List;
      return data.map((json) => Category.fromJson(json)).toList();
    } catch (e) {
      print('Error fetching categories: $e');
      // Trả về mock data nếu lỗi kết nối để app không crash
      return mockCategories;
    }
  }

  Future<List<Product>> getProducts() async {
    try {
      final response = await DioClient().dio.get('/menu');
      final data = response.data['products'] as List;
      return data.map((json) => Product.fromJson(json)).toList();
    } catch (e) {
      print('Error fetching products: $e');
      return mockProducts;
    }
  }
}
