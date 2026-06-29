import 'dart:async';
import 'dart:convert';

import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../data/models/cart_item.dart';
import '../../../data/models/enums.dart' as api;
import '../../../data/models/order_item.dart';
<<<<<<< Updated upstream
=======
import '../../../data/models/order_model.dart';
>>>>>>> Stashed changes
import '../../../data/repositories/order_repository.dart';
import 'order_event.dart';
import 'order_state.dart';

class OrderBloc extends Bloc<OrderEvent, OrderState> {
  final OrderRepository repository;
  StreamSubscription? _socketSubscription;
<<<<<<< Updated upstream
  String? _currentTableId;
=======
  Timer? _trackingTimer;
>>>>>>> Stashed changes

  OrderBloc({required this.repository}) : super(const OrderState()) {
    on<PlaceOrder>(_onPlaceOrder);
    on<RefreshTrackedOrder>(_onRefreshTrackedOrder);
    on<UpdateOrderStatus>(_onUpdateOrderStatus);
<<<<<<< Updated upstream
    on<ClearOrder>((event, emit) {
      _currentTableId = null;
      emit(const OrderState());
    });

    // Lắng nghe Stream Socket ngay khi Bloc khởi tạo
    _socketSubscription = repository.orderUpdatesStream.listen((data) {
      if (!isClosed && data['event'] == 'ORDER_UPDATED') {
        final payload = data['payload'] as Map<String, dynamic>?;
        if (payload != null && payload['status'] != null) {
          // Lấy status từ payload. Vì đang mock, ta mô phỏng trạng thái advance
          for (var item in state.items) {
             if (item.status == OrderStatus.pending) {
               add(UpdateOrderStatus(item.id, OrderStatus.preparing.index));
               break; // Chỉ advance 1 item mỗi lần cho demo
             } else if (item.status == OrderStatus.preparing) {
               add(UpdateOrderStatus(item.id, OrderStatus.served.index));
               break;
             }
          }
        }
=======
    on<ClearOrder>(_onClearOrder);

    _socketSubscription = repository.orderUpdatesStream.listen((data) {
      if (isClosed || data.isEmpty) return;
      final payload = data['payload'] as Map<String, dynamic>?;
      final trackingCode = payload?['trackingCode']?.toString();
      if (trackingCode != null && trackingCode == state.trackingCode) {
        add(RefreshTrackedOrder());
>>>>>>> Stashed changes
      }
    });
  }

  Future<void> _onPlaceOrder(PlaceOrder event, Emitter<OrderState> emit) async {
<<<<<<< Updated upstream
    _currentTableId = event.tableId;
    
    final now = DateTime.now().microsecondsSinceEpoch;
    final newItems = event.cartItems.asMap().entries.map((entry) {
      return OrderItem(
        id: '${now}_${entry.key}',
        product: entry.value.product,
        quantity: entry.value.quantity,
        notes: entry.value.notes,
        status: OrderStatus.pending,
=======
    emit(state.copyWith(isSubmitting: true, clearError: true));

    try {
      final order = await repository.placeOrder(event.tableId, event.cartItems);
      final uiStatus = _toUiOrderStatus(order.status);
      final orderItems = _cartItemsToOrderItems(
        event.cartItems,
        order.orderId.toString(),
        uiStatus,
>>>>>>> Stashed changes
      );
      emit(
        state.copyWith(
          items: [...state.items, ...orderItems],
          orderId: order.orderId.toString(),
          trackingCode: order.trackingCode,
          isSubmitting: false,
          clearError: true,
        ),
      );
      repository.joinOrderTracking(order.trackingCode);
      _startTrackingTimer();
    } catch (e) {
      emit(state.copyWith(isSubmitting: false, errorMessage: _formatError(e)));
    }
  }

<<<<<<< Updated upstream
    final updatedList = List<OrderItem>.from(state.items)..addAll(newItems);
    final currentOrderId = state.orderId.isEmpty ? 'GP${now.toString().substring(5, 10)}' : state.orderId;
    emit(state.copyWith(items: updatedList, orderId: currentOrderId));

    try {
      final totalAmount = event.cartItems.fold(0.0, (sum, item) => sum + (item.product.price * item.quantity));
      await repository.placeOrder(0, event.cartItems, totalAmount);
    } catch (e) {
      // Giữ mock items
=======
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
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  @override
  Future<void> close() {
    _socketSubscription?.cancel();
=======
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
    final orderItemPrefix = '${order.orderId}_';
    final updatedItems = state.items.map((item) {
      if (!item.id.startsWith(orderItemPrefix)) return item;
      return item.copyWith(status: status);
    }).toList();

    return state.copyWith(
      items: updatedItems,
      orderId: order.orderId.toString(),
      trackingCode: order.trackingCode,
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
      case api.OrderStatus.newOrder:
      case api.OrderStatus.cancel:
        return OrderStatus.pending;
    }
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
>>>>>>> Stashed changes
    return super.close();
  }
}
