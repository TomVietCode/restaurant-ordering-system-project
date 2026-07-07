import 'package:freezed_annotation/freezed_annotation.dart';

part 'product.freezed.dart';
part 'product.g.dart';

@freezed
abstract class Product with _$Product {
  const factory Product({
    @JsonKey(name: 'item_id') required int id,
    required String name,
    @JsonKey(name: 'category_id') required int categoryId,
    required double price,
    @JsonKey(name: 'is_remain') required bool isRemain,
    @JsonKey(name: 'images_url') @Default([]) List<String> imagesUrl,
    String? description,
  }) = _Product;

  factory Product.fromJson(Map<String, dynamic> json) =>
      _$ProductFromJson(json);
}
