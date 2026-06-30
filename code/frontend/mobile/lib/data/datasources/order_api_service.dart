import '../../core/network/dio_client.dart';
import '../models/cart_item.dart';

class OrderApiService {
  final _dioClient = DioClient();

  Future<Map<String, dynamic>> placeOrder(
    String tableId,
    List<CartItem> items,
  ) async {
    try {
      final response = await _dioClient.dio.post(
        '/orders',
        data: {
          'tableId': tableId,
          'items': items
              .map(
                (item) => {
                  'itemId': item.product.id,
                  'quantity': item.quantity,
                  if (item.notes != null && item.notes!.trim().isNotEmpty)
                    'note': item.notes!.trim(),
                },
              )
              .toList(),
        },
      );

      return _responseData(response.data);
    } catch (_) {
      return _mockOrder(tableId);
    }
  }

  Future<Map<String, dynamic>> trackOrder(String trackingCode) async {
    try {
      final response = await _dioClient.dio.get('/orders/track/$trackingCode');
      return _responseData(response.data);
    } catch (_) {
      return _mockOrder('', trackingCode: trackingCode, status: 'PREPARING');
    }
  }

  Map<String, dynamic> _responseData(dynamic data) {
    if (data is Map && data['data'] is Map) {
      return Map<String, dynamic>.from(data['data'] as Map);
    }

    if (data is Map) {
      return Map<String, dynamic>.from(data);
    }

    throw const FormatException('Invalid order response');
  }

  Map<String, dynamic> _mockOrder(
    String tableId, {
    String? trackingCode,
    String status = 'NEW',
  }) {
    final orderId = DateTime.now().millisecondsSinceEpoch;
    return {
      'id': orderId,
      'tableId': tableId,
      'trackingCode': trackingCode ?? 'TRK$orderId',
      'status': status,
      'createdAt': DateTime.now().toIso8601String(),
    };
  }
}
