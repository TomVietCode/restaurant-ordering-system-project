import 'enums.dart';

class OrderModel {
  final int orderId;
  final String tableId;
  final String trackingCode;
  final OrderStatus status;
  final double? totalAmount;
  final PaymentMethod? paymentMethod;
  final DateTime createdAt;
  final DateTime? paidAt;

  OrderModel({
    required this.orderId,
    required this.tableId,
    required this.trackingCode,
    required this.status,
    this.totalAmount,
    this.paymentMethod,
    required this.createdAt,
    this.paidAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    final totalAmount = json['totalAmount'] ?? json['total_amount'];
    final createdAt = json['createdAt'] ?? json['created_at'];
    final paidAt = json['paidAt'] ?? json['paid_at'];
    final paymentMethod = json['paymentMethod'] ?? json['payment_method'];

    return OrderModel(
      orderId: json['id'] ?? json['order_id'],
      tableId: (json['tableId'] ?? json['table_id']).toString(),
      trackingCode: (json['trackingCode'] ?? json['tracking_code'] ?? '')
          .toString(),
      status: OrderStatus.fromString(json['status'] ?? ''),
      totalAmount: totalAmount != null
          ? double.tryParse(totalAmount.toString())
          : null,
      paymentMethod: paymentMethod != null
          ? PaymentMethod.fromString(paymentMethod.toString())
          : null,
      createdAt: DateTime.parse(createdAt.toString()),
      paidAt: paidAt != null ? DateTime.parse(paidAt.toString()) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'order_id': orderId,
      'table_id': tableId,
      'tracking_code': trackingCode,
      'status': status.value,
      'total_amount': totalAmount,
      'payment_method': paymentMethod?.value,
      'created_at': createdAt.toIso8601String(),
      'paid_at': paidAt?.toIso8601String(),
    };
  }
}
