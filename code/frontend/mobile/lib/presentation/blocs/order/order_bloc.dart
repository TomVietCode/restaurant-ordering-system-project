import 'dart:async';
import 'dart:convert';

import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../data/models/cart_item.dart';
import '../../../data/models/enums.dart' as api;
import '../../../data/models/order_item.dart';
import '../../../data/models/order_model.dart';
import '../../../data/repositories/order_repository.dart';
import 'order_event.dart';
import 'order_state.dart';

class OrderBloc extends Bloc<OrderEvent, OrderState> {
  final OrderRepository repository;
  StreamSubscription? _socketSubscription;
  Timer? _trackingTimer;

  OrderBloc({required this.repository}) : super(const OrderState()) {
    on<PlaceOrder>(_onPlaceOrder);
    on<RefreshTrackedOrder>(_onRefreshTrackedOrder);
    on<ApplyTrackedOrderStatus>(_onApplyTrackedOrderStatus);
    on<UpdateOrderStatus>(_onUpdateOrderStatus);
    on<ClearOrder>(_onClearOrder);

    _socketSubscription = repository.orderUpdatesStream.listen((data) {
      if (isClosed || data.isEmpty) return;
      final payload = data['payload'] as Map<String, dynamic>?;
      if (payload == null) return;

      final trackingCode = _stringValue(payload, [
        'trackingCode',
        'tracking_code',
      ]);
      final orderId = _stringValue(payload, ['orderId', 'order_id', 'id']);
      final status = _stringValue(payload, ['status']);
      final isCurrentTracking =
          trackingCode != null && trackingCode == state.trackingCode;
      final isCurrentOrder = orderId != null && orderId == state.orderId;

      if (isCurrentTracking || isCurrentOrder) {
        if (status != null) {
          add(ApplyTrackedOrderStatus(status));
        }
        add(RefreshTrackedOrder());
      }
    });
  }

  Future<void> _onPlaceOrder(PlaceOrder event, Emitter<OrderState> emit) async {
    emit(state.copyWith(isSubmitting: true, clearError: true));

    try {
      final order = await repository.placeOrder(event.tableId, event.cartItems);
      final trackingCode = order.trackingCode.isNotEmpty
          ? order.trackingCode
          : 'ORDER-${order.orderId}';
      final uiStatus = _toUiOrderStatus(order.status);
      final orderItems = _cartItemsToOrderItems(
        event.cartItems,
        order.orderId.toString(),
        uiStatus,
      );

      emit(
        state.copyWith(
          items: [...state.items, ...orderItems],
          orderId: order.orderId.toString(),
          trackingCode: trackingCode,
          isSubmitting: false,
          clearError: true,
        ),
      );

      repository.joinOrderTracking(trackingCode);
      _startTrackingTimer();
    } catch (e) {
      emit(state.copyWith(isSubmitting: false, errorMessage: _formatError(e)));
    }
  }

  Future<void> _onRefreshTrackedOrder(
    RefreshTrackedOrder event,
    Emitter<OrderState> emit,
  ) async {
    if (state.trackingCode.isEmpty) return;

    try {
      final order = await repository.trackOrder(state.trackingCode);
      emit(_stateFromTrackedOrder(order));
    } catch (e) {
      emit(state.copyWith(errorMessage: _formatError(e)));
    }
  }

  void _onUpdateOrderStatus(UpdateOrderStatus event, Emitter<OrderState> emit) {
    final updatedList = state.items.map((item) {
      if (item.id == event.itemId) {
        return item.copyWith(status: OrderStatus.values[event.statusIndex]);
      }
      return item;
    }).toList();
    emit(state.copyWith(items: updatedList));
  }

  void _onApplyTrackedOrderStatus(
    ApplyTrackedOrderStatus event,
    Emitter<OrderState> emit,
  ) {
    final status = _toUiOrderStatus(api.OrderStatus.fromString(event.status));
    emit(state.copyWith(items: _itemsWithStatus(status), clearError: true));
  }

  void _onClearOrder(ClearOrder event, Emitter<OrderState> emit) {
    _trackingTimer?.cancel();
    emit(const OrderState());
  }

  List<OrderItem> _cartItemsToOrderItems(
    List<CartItem> cartItems,
    String orderId,
    OrderStatus status,
  ) {
    return cartItems.asMap().entries.map((entry) {
      final item = entry.value;
      return OrderItem(
        id: '${orderId}_${entry.key}',
        product: item.product,
        quantity: item.quantity,
        notes: item.notes,
        status: status,
      );
    }).toList();
  }

  OrderState _stateFromTrackedOrder(OrderModel order) {
    final status = _toUiOrderStatus(order.status);
    final orderId = order.orderId.toString();
    final items = order.items == null
        ? _itemsWithStatus(status, orderId: orderId)
        : _itemsFromTrackedOrder(order.items!, status, orderId: orderId);

    return state.copyWith(
      items: items,
      orderId: orderId,
      trackingCode: order.trackingCode.isNotEmpty
          ? order.trackingCode
          : state.trackingCode,
      clearError: true,
    );
  }

  OrderStatus _toUiOrderStatus(api.OrderStatus status) {
    switch (status) {
      case api.OrderStatus.preparing:
        return OrderStatus.preparing;
      case api.OrderStatus.served:
      case api.OrderStatus.paid:
        return OrderStatus.served;
      case api.OrderStatus.cancel:
        return OrderStatus.cancelled;
      case api.OrderStatus.newOrder:
        return OrderStatus.pending;
    }
  }

  List<OrderItem> _itemsFromTrackedOrder(
    List<OrderLineModel> trackedItems,
    OrderStatus fallbackStatus, {
    required String orderId,
  }) {
    final updatedItems = <OrderItem>[];
    final usedIndexes = <int>{};

    for (final line in trackedItems.where((item) => item.shouldShow)) {
      final index = _indexOfMatchingLine(line, usedIndexes);
      if (index == -1) continue;

      usedIndexes.add(index);
      final status = line.status != null
          ? _toUiOrderStatus(line.status!)
          : fallbackStatus;

      updatedItems.add(
        state.items[index].copyWith(
          id: '${orderId}_$index',
          quantity: line.quantity,
          status: status,
        ),
      );
    }

    return updatedItems;
  }

  int _indexOfMatchingLine(OrderLineModel line, Set<int> usedIndexes) {
    for (var index = 0; index < state.items.length; index++) {
      if (usedIndexes.contains(index)) continue;
      if (_matchesLine(state.items[index], line)) return index;
    }

    return -1;
  }

  bool _matchesLine(OrderItem item, OrderLineModel line) {
    if (line.itemId != null && line.itemId != item.product.id) {
      return false;
    }

    final lineNote = line.note?.trim();
    if (lineNote == null || lineNote.isEmpty) return true;
    return (item.notes ?? '').trim() == lineNote;
  }

  List<OrderItem> _itemsWithStatus(OrderStatus status, {String? orderId}) {
    final currentOrderId = orderId?.isNotEmpty == true
        ? orderId!
        : state.orderId;
    var foundCurrentOrderItems = false;

    final updatedItems = state.items.map((item) {
      if (currentOrderId.isNotEmpty &&
          item.id.startsWith('${currentOrderId}_')) {
        foundCurrentOrderItems = true;
        return item.copyWith(status: status);
      }
      return item;
    }).toList();

    if (foundCurrentOrderItems) return updatedItems;
    return state.items.map((item) => item.copyWith(status: status)).toList();
  }

  String? _stringValue(Map<String, dynamic> map, List<String> keys) {
    for (final key in keys) {
      final value = map[key];
      if (value != null && value.toString().isNotEmpty) {
        return value.toString();
      }
    }
    return null;
  }

  void _startTrackingTimer() {
    _trackingTimer?.cancel();
    _trackingTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      if (!isClosed && state.trackingCode.isNotEmpty) {
        add(RefreshTrackedOrder());
      }
    });
  }

  String _formatError(Object error) {
    try {
      final data = jsonDecode(error.toString());
      if (data is Map<String, dynamic> && data['message'] != null) {
        return data['message'].toString();
      }
    } catch (_) {
      // Fall through to text cleanup.
    }

    return error.toString().replaceFirst('Exception: ', '');
  }

  @override
  Future<void> close() {
    _socketSubscription?.cancel();
    _trackingTimer?.cancel();
    return super.close();
  }
}
