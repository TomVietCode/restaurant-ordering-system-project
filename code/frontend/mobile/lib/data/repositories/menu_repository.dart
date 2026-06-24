import '../models/category.dart';
import '../models/product.dart';
import '../datasources/mock_data.dart';

class MenuRepository {
  Future<List<Category>> getCategories() async {
    await Future.delayed(const Duration(milliseconds: 800));
    return mockCategories;
  }

  Future<List<Product>> getProducts() async {
    await Future.delayed(const Duration(milliseconds: 1000));
    return mockProducts;
  }
}
