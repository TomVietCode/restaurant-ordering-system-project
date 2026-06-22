import 'package:flutter_bloc/flutter_bloc.dart';
import 'dart:async';
import '../../../data/models/order_item.dart';
import 'order_event.dart';
import 'order_state.dart';

class OrderBloc extends Bloc<OrderEvent, OrderState> {
  OrderBloc() : super(const OrderState()) {
    on<PlaceOrder>(_onPlaceOrder);
    on<UpdateOrderStatus>(_onUpdateOrderStatus);
    on<ClearOrder>((event, emit) => emit(const OrderState()));
  }

  void _onPlaceOrder(PlaceOrder event, Emitter<OrderState> emit) {
    final now = DateTime.now().microsecondsSinceEpoch;
    final newItems = event.cartItems.asMap().entries.map((entry) {
      return OrderItem(
        id: '${now}_${entry.key}',
        product: entry.value.product,
        quantity: entry.value.quantity,
        notes: entry.value.notes,
        status: OrderStatus.pending,
      );
    }).toList();

    final updatedList = List<OrderItem>.from(state.items)..addAll(newItems);
    
    final currentOrderId = state.orderId.isEmpty ? 'GP${now.toString().substring(5, 10)}' : state.orderId;

    emit(state.copyWith(items: updatedList, orderId: currentOrderId));

    // Mô phỏng tự động đổi trạng thái đơn hàng sau vài giây
    for (var item in newItems) {
      _simulateStatusProgress(item.id);
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

  void _simulateStatusProgress(String itemId) async {
    await Future.delayed(const Duration(seconds: 10)); // 10s sau chuyển sang Đang chuẩn bị
    if (isClosed) return;
    add(UpdateOrderStatus(itemId, OrderStatus.preparing.index));

    await Future.delayed(const Duration(seconds: 15)); // Thêm 15s sau chuyển sang Đã phục vụ
    if (isClosed) return;
    add(UpdateOrderStatus(itemId, OrderStatus.served.index));
  }
}
