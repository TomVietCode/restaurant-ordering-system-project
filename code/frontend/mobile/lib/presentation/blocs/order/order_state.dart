import 'package:equatable/equatable.dart';
import '../../../data/models/order_item.dart';

class OrderState extends Equatable {
  final List<OrderItem> items;
  final String orderId;
  final String trackingCode;
  final bool isSubmitting;
  final String? errorMessage;

  const OrderState({
    this.items = const [],
    this.orderId = '',
    this.trackingCode = '',
    this.isSubmitting = false,
    this.errorMessage,
  });

  OrderState copyWith({
    List<OrderItem>? items,
    String? orderId,
    String? trackingCode,
    bool? isSubmitting,
    String? errorMessage,
    bool clearError = false,
  }) {
    return OrderState(
      items: items ?? this.items,
      orderId: orderId ?? this.orderId,
      trackingCode: trackingCode ?? this.trackingCode,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      errorMessage: clearError ? null : errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [
    items,
    orderId,
    trackingCode,
    isSubmitting,
    errorMessage,
  ];
}
