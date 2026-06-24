import 'product.dart';

enum OrderStatus { pending, preparing, served }

class OrderItem {
  final String id;
  final Product product;
  final int quantity;
  final String? notes;
  final OrderStatus status;

  OrderItem({
    required this.id,
    required this.product,
    required this.quantity,
    this.notes,
    this.status = OrderStatus.pending,
  });

  OrderItem copyWith({
    String? id,
    Product? product,
    int? quantity,
    String? notes,
    OrderStatus? status,
  }) {
    return OrderItem(
      id: id ?? this.id,
      product: product ?? this.product,
      quantity: quantity ?? this.quantity,
      notes: notes ?? this.notes,
      status: status ?? this.status,
    );
  }
}
