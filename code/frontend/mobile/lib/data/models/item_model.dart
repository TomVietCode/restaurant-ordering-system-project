class ItemModel {
  final int itemId;
  final String name;
  final double price;
  final List<String> imagesUrl; // Chứa mảng JSON string cho hình ảnh
  final String? description;
  final bool isRemain;
  final int categoryId;

  ItemModel({
    required this.itemId,
    required this.name,
    required this.price,
    this.imagesUrl = const [],
    this.description,
    this.isRemain = true,
    required this.categoryId,
  });

  factory ItemModel.fromJson(Map<String, dynamic> json) {
    return ItemModel(
      itemId: json['item_id'],
      name: json['name'],
      price: (json['price'] as num).toDouble(),
      imagesUrl: json['images_url'] != null ? List<String>.from(json['images_url']) : [],
      description: json['description'],
      isRemain: json['is_remain'] ?? true,
      categoryId: json['category_id'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'item_id': itemId,
      'name': name,
      'price': price,
      'images_url': imagesUrl,
      'description': description,
      'is_remain': isRemain,
      'category_id': categoryId,
    };
  }
}
