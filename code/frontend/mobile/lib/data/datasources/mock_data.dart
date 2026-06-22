import '../models/category.dart';
import '../models/product.dart';

// MOCK CATEGORIES
const List<Category> mockCategories = [
  Category(id: 1, name: 'Cà phê Phin', description: 'Cà phê truyền thống đậm đà bản sắc'),
  Category(id: 2, name: 'Trà Sữa & Macchiato', description: 'Trà sữa đậm vị, béo ngậy'),
  Category(id: 3, name: 'Trái Cây Xay & Sinh Tố', description: 'Thanh mát, giải nhiệt mùa hè'),
  Category(id: 4, name: 'Bánh Ngọt & Tráng Miệng', description: 'Ăn kèm siêu cuốn'),
  Category(id: 5, name: 'Đồ Ăn Vặt Mùa Đông (Category Rỗng)', description: 'Danh mục hiện tại chưa có món'),
];

// MOCK PRODUCTS
const List<Product> mockProducts = [
  Product(
    id: 101,
    name: 'Cà phê Đen Đá',
    categoryId: 1,
    price: 29000,
    isRemain: true,
    imagesUrl: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80'],
    description: 'Cà phê robusta rang mộc nguyên chất, đậm vị đắng.',
  ),
  Product(
    id: 102,
    name: 'Cà phê Sữa Đá',
    categoryId: 1,
    price: 35000,
    isRemain: true,
    imagesUrl: ['https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&q=80'],
    description: 'Sự hòa quyện hoàn hảo giữa cà phê robusta và sữa đặc.',
  ),
  Product(
    id: 103,
    name: 'Bạc Xỉu',
    categoryId: 1,
    price: 39000,
    isRemain: false, 
    imagesUrl: ['https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80'],
    description: 'Nhiều sữa, ít cà phê.',
  ),
  Product(
    id: 201,
    name: 'Trà Sữa Oolong Nướng (Tên Dài Để Test UI)',
    categoryId: 2,
    price: 55000,
    isRemain: true,
    imagesUrl: ['https://images.unsplash.com/photo-1558857563-b37102e96041?w=500&q=80'],
  ),
  Product(
    id: 202,
    name: 'Trà Đào Cam Sả',
    categoryId: 2,
    price: 45000,
    isRemain: true,
    imagesUrl: [], 
    description: 'Thanh mát ngọt ngào với đào miếng to.',
  ),
  Product(
    id: 301,
    name: 'Sinh tố Dâu Tây Mộc Châu',
    categoryId: 3,
    price: 50000,
    isRemain: true,
    imagesUrl: ['https://images.unsplash.com/photo-1628557044797-f21a177c37ec?w=500&q=80'],
  ),
  Product(
    id: 401,
    name: 'Tiramisu',
    categoryId: 4,
    price: 49000,
    isRemain: true,
    imagesUrl: ['https://images.unsplash.com/photo-1571115177098-24de17e889a9?w=500&q=80'],
  ),
  Product(
    id: 402,
    name: 'Bánh Mì Phô Mai Bơ Tỏi (Đang Hết)',
    categoryId: 4,
    price: 35000,
    isRemain: false, 
    imagesUrl: ['https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=500&q=80'],
  ),
];
