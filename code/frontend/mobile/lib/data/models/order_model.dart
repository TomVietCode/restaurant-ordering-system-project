import 'enums.dart';

class OrderModel {
  final int orderId;
  final String tableId;
  final String trackingCode;
  final OrderStatus status;
  final List<OrderLineModel>? items;
  final double? totalAmount;
  final PaymentMethod? paymentMethod;
  final DateTime createdAt;
  final DateTime? paidAt;

  OrderModel({
    required this.orderId,
    required this.tableId,
    required this.trackingCode,
    required this.status,
    this.items,
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
      items: _lineItemsFromJson(json),
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
      'items': items?.map((item) => item.toJson()).toList(),
      'total_amount': totalAmount,
      'payment_method': paymentMethod?.value,
      'created_at': createdAt.toIso8601String(),
      'paid_at': paidAt?.toIso8601String(),
    };
  }

  static List<OrderLineModel>? _lineItemsFromJson(Map<String, dynamic> json) {
    final rawItems =
        json['items'] ??
        json['orderItems'] ??
        json['order_items'] ??
        json['orderDetails'] ??
        json['order_details'];

    if (rawItems is! List) return null;

    return rawItems
        .whereType<Map>()
        .map((item) => OrderLineModel.fromJson(Map<String, dynamic>.from(item)))
        .toList();
  }
}

class OrderLineModel {
  final int? itemId;
  final int quantity;
  final String? note;
  final OrderStatus? status;
  final bool removed;

  const OrderLineModel({
    required this.itemId,
    required this.quantity,
    this.note,
    this.status,
    this.removed = false,
  });

  bool get shouldShow => !removed && quantity > 0;

  factory OrderLineModel.fromJson(Map<String, dynamic> json) {
    final nestedItem =
        json['item'] ??
        json['menuItem'] ??
        json['menu_item'] ??
        json['product'];
    final nestedItemMap = nestedItem is Map
        ? Map<String, dynamic>.from(nestedItem)
        : null;
    final rawStatus =
        json['status'] ?? json['itemStatus'] ?? json['item_status'];

    return OrderLineModel(
      itemId: _intValue([
        json['itemId'],
        json['item_id'],
        json['menuItemId'],
        json['menu_item_id'],
        json['productId'],
        json['product_id'],
        nestedItemMap?['id'],
      ]),
      quantity: _intValue([json['quantity'], json['qty']]) ?? 1,
      note: (json['note'] ?? json['notes'])?.toString(),
      status: rawStatus != null
          ? OrderStatus.fromString(rawStatus.toString())
          : null,
      removed:
          json['deletedAt'] != null ||
          json['deleted_at'] != null ||
          json['isDeleted'] == true ||
          json['is_deleted'] == true ||
          json['deleted'] == true ||
          json['cancelled'] == true ||
          json['canceled'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'item_id': itemId,
      'quantity': quantity,
      'note': note,
      'status': status?.value,
      'removed': removed,
    };
  }

  static int? _intValue(List<dynamic> values) {
    for (final value in values) {
      if (value == null) continue;
      final parsed = int.tryParse(value.toString());
      if (parsed != null) return parsed;
    }
    return null;
  }
}
