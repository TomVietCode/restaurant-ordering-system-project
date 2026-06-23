import 'package:flutter_bloc/flutter_bloc.dart';
import 'dart:async';
import '../../../data/models/order_item.dart';
import '../../../data/repositories/order_repository.dart';
import 'order_event.dart';
import 'order_state.dart';

class OrderBloc extends Bloc<OrderEvent, OrderState> {
  final OrderRepository repository;
  StreamSubscription? _socketSubscription;
  String? _currentTableId;

  OrderBloc({required this.repository}) : super(const OrderState()) {
    on<PlaceOrder>(_onPlaceOrder);
    on<UpdateOrderStatus>(_onUpdateOrderStatus);
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
      }
    });
  }

  Future<void> _onPlaceOrder(PlaceOrder event, Emitter<OrderState> emit) async {
    _currentTableId = event.tableId;
    
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

    try {
      final totalAmount = event.cartItems.fold(0.0, (sum, item) => sum + (item.product.price * item.quantity));
      await repository.placeOrder(0, event.cartItems, totalAmount);
    } catch (e) {
      // Giữ mock items
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

  @override
  Future<void> close() {
    _socketSubscription?.cancel();
    return super.close();
  }
}
