import 'package:equatable/equatable.dart';
import '../../../data/models/cart_item.dart';

class CartState extends Equatable {
  final List<CartItem> items;
  final double totalAmount;

  const CartState({this.items = const [], this.totalAmount = 0.0});

  CartState copyWith({List<CartItem>? items, double? totalAmount}) {
    return CartState(
      items: items ?? this.items,
      totalAmount: totalAmount ?? this.totalAmount,
    );
  }

  @override
  List<Object?> get props => [items, totalAmount];
}
