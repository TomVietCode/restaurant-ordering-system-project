import 'package:equatable/equatable.dart';
import '../../../data/models/order_item.dart';

class OrderState extends Equatable {
  final List<OrderItem> items;
  final String orderId;

  const OrderState({
    this.items = const [],
    this.orderId = '',
  });

  OrderState copyWith({
    List<OrderItem>? items,
    String? orderId,
  }) {
    return OrderState(
      items: items ?? this.items,
      orderId: orderId ?? this.orderId,
    );
  }

  @override
  List<Object?> get props => [items, orderId];
}
