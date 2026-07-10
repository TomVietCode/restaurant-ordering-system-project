import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/network/websocket_client.dart';
import '../../../data/models/cart_item.dart';
import 'cart_event.dart';
import 'cart_state.dart';

class CartBloc extends Bloc<CartEvent, CartState> {
  StreamSubscription<Map<String, dynamic>>? _menuUpdatesSubscription;

  CartBloc({Stream<Map<String, dynamic>>? menuUpdatesStream})
    : super(const CartState()) {
    on<AddProductToCart>(_onAddProduct);
    on<UpdateCartItemQuantity>(_onUpdateQuantity);
    on<RemoveProductFromCart>(_onRemoveProduct);
    on<UpdateCartProductAvailability>(_onUpdateProductAvailability);
    on<ClearCart>(_onClearCart);

    _menuUpdatesSubscription = (menuUpdatesStream ?? WebSocketClient().stream)
        .listen(_handleMenuUpdate);
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

  void _onUpdateProductAvailability(
    UpdateCartProductAvailability event,
    Emitter<CartState> emit,
  ) {
    bool changed = false;
    final updatedItems = state.items.map((item) {
      if (item.product.id != event.itemId) return item;
      if (item.product.isRemain == event.isRemain) return item;

      changed = true;
      return item.copyWith(
        product: item.product.copyWith(isRemain: event.isRemain),
      );
    }).toList();

    if (!changed) return;

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

  void _handleMenuUpdate(Map<String, dynamic> data) {
    if (data['event'] != 'menu:item-availability-changed') return;

    final payload = data['payload'];
    if (payload is! Map) return;

    final itemId = _intValue(payload, ['itemId', 'item_id', 'id']);
    final isRemain = _boolValue(payload, ['isRemain', 'is_remain']);

    if (itemId == null || isRemain == null || isClosed) return;

    add(UpdateCartProductAvailability(itemId: itemId, isRemain: isRemain));
  }

  int? _intValue(Map<dynamic, dynamic> map, List<String> keys) {
    for (final key in keys) {
      final value = map[key];
      if (value == null) continue;

      final parsed = int.tryParse(value.toString());
      if (parsed != null) return parsed;
    }

    return null;
  }

  bool? _boolValue(Map<dynamic, dynamic> map, List<String> keys) {
    for (final key in keys) {
      final value = map[key];
      if (value is bool) return value;
      if (value == null) continue;

      final normalized = value.toString().trim().toLowerCase();
      if (normalized == 'true') return true;
      if (normalized == 'false') return false;
    }

    return null;
  }

  @override
  Future<void> close() {
    _menuUpdatesSubscription?.cancel();
    return super.close();
  }
}
