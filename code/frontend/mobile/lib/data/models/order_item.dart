import 'product.dart';

enum OrderStatus { pending, preparing, served, cancelled }

class OrderItem {
  final String id;
  final Product product;
  final int quantity;
  final String? notes;
  final OrderStatus status;
  final String orderCode;

  OrderItem({
    required this.id,
    required this.product,
    required this.quantity,
    this.notes,
    this.status = OrderStatus.pending,
    this.orderCode = '',
  });

  OrderItem copyWith({
    String? id,
    Product? product,
    int? quantity,
    String? notes,
    OrderStatus? status,
    String? orderCode,
  }) {
    return OrderItem(
      id: id ?? this.id,
      product: product ?? this.product,
      quantity: quantity ?? this.quantity,
      notes: notes ?? this.notes,
      status: status ?? this.status,
      orderCode: orderCode ?? this.orderCode,
    );
  }
}
