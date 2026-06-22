import '../models/category_model.dart';
import '../models/item_model.dart';

class MockData {
  static final List<CategoryModel> categories = [
    CategoryModel(categoryId: 1, name: 'Món chính'),
    CategoryModel(categoryId: 2, name: 'Khai vị'),
    CategoryModel(categoryId: 3, name: 'Đồ uống'),
    CategoryModel(categoryId: 4, name: 'Tráng miệng'),
  ];

  static final List<ItemModel> menuItems = [
    ItemModel(
      itemId: 1,
      name: 'Phở Bò Đặc Biệt',
      price: 125000,
      description: 'Nước dùng hầm xương 24h, thịt bò\nWagyu thượng hạng, kèm quẩy và rau',
      imagesUrl: ['https://placehold.co/308x192'],
      categoryId: 1,
    ),
    ItemModel(
      itemId: 2,
      name: 'Cơm Tấm Sườn Bì',
      price: 85000,
      description: 'Sườn cốt lết nướng than hoa, bì heo\nthái chỉ dẻo thơm, chả trứng hấp…',
      imagesUrl: ['https://placehold.co/308x192'],
      categoryId: 1,
    ),
    ItemModel(
      itemId: 3,
      name: 'Bún Chả Hà Nội',
      price: 95000,
      description: 'Thịt nướng than hoa thơm lừng, nước\nchấm chua ngọt pha chuẩn vị truyền',
      imagesUrl: ['https://placehold.co/308x192'],
      categoryId: 1,
    ),
  ];
}
