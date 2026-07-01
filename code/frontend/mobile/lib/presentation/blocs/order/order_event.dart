import 'package:equatable/equatable.dart';
import '../../../data/models/cart_item.dart';

abstract class OrderEvent extends Equatable {
  const OrderEvent();
  @override
  List<Object?> get props => [];
}

class PlaceOrder extends OrderEvent {
  final String tableId;
  final List<CartItem> cartItems;
  const PlaceOrder(this.tableId, this.cartItems);
  @override
  List<Object?> get props => [tableId, cartItems];
}

class UpdateOrderStatus extends OrderEvent {
  final String itemId;
  final int statusIndex;
  const UpdateOrderStatus(this.itemId, this.statusIndex);
  @override
  List<Object?> get props => [itemId, statusIndex];
}

class RefreshTrackedOrder extends OrderEvent {}

class ApplyTrackedOrderStatus extends OrderEvent {
  final String status;
  final String? trackingCode;
  final String? orderId;

  const ApplyTrackedOrderStatus(this.status, {this.trackingCode, this.orderId});

  @override
  List<Object?> get props => [status, trackingCode, orderId];
}

class ClearOrder extends OrderEvent {}
