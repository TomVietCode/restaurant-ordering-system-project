import 'enums.dart';

class OrderModel {
  final int orderId;
  final int tableId;
  final OrderStatus status;
  final double? totalAmount;
  final PaymentMethod? paymentMethod;
  final DateTime createdAt;
  final DateTime? paidAt;

  OrderModel({
    required this.orderId,
    required this.tableId,
    required this.status,
    this.totalAmount,
    this.paymentMethod,
    required this.createdAt,
    this.paidAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      orderId: json['order_id'],
      tableId: json['table_id'],
      status: OrderStatus.fromString(json['status'] ?? ''),
      totalAmount: json['total_amount'] != null ? (json['total_amount'] as num).toDouble() : null,
      paymentMethod: json['payment_method'] != null ? PaymentMethod.fromString(json['payment_method']) : null,
      createdAt: DateTime.parse(json['created_at']),
      paidAt: json['paid_at'] != null ? DateTime.parse(json['paid_at']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'order_id': orderId,
      'table_id': tableId,
      'status': status.value,
      'total_amount': totalAmount,
      'payment_method': paymentMethod?.value,
      'created_at': createdAt.toIso8601String(),
      'paid_at': paidAt?.toIso8601String(),
    };
  }
}
