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
    if (event.quantity <= 0) return;

    final updatedItems = List<CartItem>.from(state.items);
    final index = _indexOfItem(updatedItems, event.product.id, event.notes);
    if (index >= 0) {
      final currentItem = updatedItems[index];
      updatedItems[index] = currentItem.copyWith(
        quantity: currentItem.quantity + event.quantity,
      );
    } else {
      updatedItems.add(
        CartItem(
          product: event.product,
          quantity: event.quantity,
          notes: event.notes,
        ),
      );
    }

    _emitItems(emit, updatedItems);
  }

  void _onUpdateQuantity(
    UpdateCartItemQuantity event,
    Emitter<CartState> emit,
  ) {
    final updatedItems = List<CartItem>.from(state.items);
    final index = _indexOfItem(updatedItems, event.product.id, event.notes);
    if (index < 0) return;

    if (event.newQuantity > 0) {
      updatedItems[index] = updatedItems[index].copyWith(
        quantity: event.newQuantity,
      );
    } else {
      updatedItems.removeAt(index);
    }

    _emitItems(emit, updatedItems);
  }

  void _onRemoveProduct(RemoveProductFromCart event, Emitter<CartState> emit) {
    final updatedItems = state.items
        .where(
          (item) =>
              item.product.id != event.productId || item.notes != event.notes,
        )
        .toList();
    _emitItems(emit, updatedItems);
  }

  void _onClearCart(ClearCart event, Emitter<CartState> emit) {
    emit(const CartState());
  }

  int _indexOfItem(List<CartItem> items, int productId, String? notes) {
    return items.indexWhere(
      (item) => item.product.id == productId && item.notes == notes,
    );
  }

  void _emitItems(Emitter<CartState> emit, List<CartItem> items) {
    emit(state.copyWith(items: items, totalAmount: _calculateTotal(items)));
  }

  double _calculateTotal(List<CartItem> items) {
    return items.fold(
      0,
      (sum, item) => sum + (item.product.price * item.quantity),
    );
  }
}
