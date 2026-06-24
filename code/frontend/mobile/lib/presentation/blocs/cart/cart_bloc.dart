import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/models/cart_item.dart';
import 'cart_event.dart';
import 'cart_state.dart';

class CartBloc extends Bloc<CartEvent, CartState> {
  CartBloc() : super(const CartState()) {
    on<AddProductToCart>(_onAddProduct);
    on<UpdateCartItemQuantity>(_onUpdateQuantity);
    on<RemoveProductFromCart>(_onRemoveProduct);
    on<ClearCart>(_onClearCart);
  }

  void _onAddProduct(AddProductToCart event, Emitter<CartState> emit) {
    final List<CartItem> updatedItems = List.from(state.items);
    final index = updatedItems.indexWhere((item) => item.product.id == event.product.id && item.notes == event.notes);

    if (index >= 0) {
      updatedItems[index] = updatedItems[index].copyWith(quantity: updatedItems[index].quantity + event.quantity);
    } else {
      updatedItems.add(CartItem(product: event.product, quantity: event.quantity, notes: event.notes));
    }

    emit(state.copyWith(items: updatedItems, totalAmount: _calculateTotal(updatedItems)));
  }

  void _onUpdateQuantity(UpdateCartItemQuantity event, Emitter<CartState> emit) {
    final List<CartItem> updatedItems = List.from(state.items);
    final index = updatedItems.indexWhere((item) => item.product.id == event.product.id && item.notes == event.notes);

    if (index >= 0) {
      if (event.newQuantity > 0) {
        updatedItems[index] = updatedItems[index].copyWith(quantity: event.newQuantity);
      } else {
        updatedItems.removeAt(index);
      }
      emit(state.copyWith(items: updatedItems, totalAmount: _calculateTotal(updatedItems)));
    }
  }

  void _onRemoveProduct(RemoveProductFromCart event, Emitter<CartState> emit) {
    final updatedItems = state.items.where((item) => !(item.product.id == event.productId && item.notes == event.notes)).toList();
    emit(state.copyWith(items: updatedItems, totalAmount: _calculateTotal(updatedItems)));
  }

  void _onClearCart(ClearCart event, Emitter<CartState> emit) {
    emit(const CartState());
  }

  double _calculateTotal(List<CartItem> items) {
    return items.fold(0, (sum, item) => sum + (item.product.price * item.quantity));
  }
}
