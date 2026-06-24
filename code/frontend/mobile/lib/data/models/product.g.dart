// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Product _$ProductFromJson(Map<String, dynamic> json) => _Product(
  id: (json['item_id'] as num).toInt(),
  name: json['name'] as String,
  categoryId: (json['category_id'] as num).toInt(),
  price: (json['price'] as num).toDouble(),
  isRemain: json['is_remain'] as bool,
  imagesUrl:
      (json['images_url'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList() ??
      const [],
  description: json['description'] as String?,
);

Map<String, dynamic> _$ProductToJson(_Product instance) => <String, dynamic>{
  'item_id': instance.id,
  'name': instance.name,
  'category_id': instance.categoryId,
  'price': instance.price,
  'is_remain': instance.isRemain,
  'images_url': instance.imagesUrl,
  'description': instance.description,
};
