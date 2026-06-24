import 'package:equatable/equatable.dart';
import '../../../data/models/product.dart';

abstract class CartEvent extends Equatable {
  const CartEvent();
  @override
  List<Object?> get props => [];
}

class AddProductToCart extends CartEvent {
  final Product product;
  final int quantity;
  final String? notes;
  const AddProductToCart({required this.product, required this.quantity, this.notes});
  @override
  List<Object?> get props => [product, quantity, notes];
}

class UpdateCartItemQuantity extends CartEvent {
  final Product product;
  final String? notes;
  final int newQuantity;
  const UpdateCartItemQuantity({required this.product, this.notes, required this.newQuantity});
  @override
  List<Object?> get props => [product, notes, newQuantity];
}

class RemoveProductFromCart extends CartEvent {
  final int productId;
  final String? notes;
  const RemoveProductFromCart(this.productId, {this.notes});
  @override
  List<Object?> get props => [productId, notes];
}

class ClearCart extends CartEvent {}
