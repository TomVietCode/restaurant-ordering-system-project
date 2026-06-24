class OrderItemModel {
  final int orderId;
  final int itemId;
  final int quantity;
  final double priceAtOrder;
  final String? note;

  OrderItemModel({
    required this.orderId,
    required this.itemId,
    required this.quantity,
    required this.priceAtOrder,
    this.note,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      orderId: json['order_id'],
      itemId: json['item_id'],
      quantity: json['quantity'],
      priceAtOrder: (json['price_at_order'] as num).toDouble(),
      note: json['note'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'order_id': orderId,
      'item_id': itemId,
      'quantity': quantity,
      'price_at_order': priceAtOrder,
      'note': note,
    };
  }
}
