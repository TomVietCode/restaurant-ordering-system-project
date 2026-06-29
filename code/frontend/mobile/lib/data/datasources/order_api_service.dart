import '../models/cart_item.dart';
<<<<<<< Updated upstream
// TODO (BƯỚC 1): Bỏ comment dòng dưới để sử dụng API Client
// import '../../core/network/dio_client.dart';

class OrderApiService {
  // TODO (BƯỚC 2): Khởi tạo (DioClient) trong Service này
  // final _dioClient = DioClient();

  /// Giả lập việc gọi API POST /orders
  Future<Map<String, dynamic>> placeOrder(int tableId, List<CartItem> items, double totalAmount) async {
    // Giả lập thời gian chờ của mạng
    await Future.delayed(const Duration(seconds: 1));
    
    // Trả về JSON giả lập (Giống hệt như Backend sẽ trả về)
    return {
      'order_id': DateTime.now().millisecondsSinceEpoch ~/ 1000,
      'table_id': tableId,
      'status': 'NEW',
      'total_amount': totalAmount,
      'created_at': DateTime.now().toIso8601String(),
    };
  }

  /// Giả lập việc gọi API GET /orders?table_id=XXX
  Future<List<dynamic>> getOrderHistory(int tableId) async {
    // Giả lập thời gian chờ của mạng
    await Future.delayed(const Duration(seconds: 1));

    // Trả về Mảng JSON giả lập chứa 3 đơn hàng
    return [
      {
        'order_id': 1001,
        'table_id': tableId,
        'status': 'PREPARING',
        'total_amount': 155000.0,
        'created_at': DateTime.now().subtract(const Duration(minutes: 15)).toIso8601String(),
      },
      {
        'order_id': 1002,
        'table_id': tableId,
        'status': 'SERVED',
        'total_amount': 45000.0,
        'created_at': DateTime.now().subtract(const Duration(minutes: 45)).toIso8601String(),
      },
      {
        'order_id': 1003,
        'table_id': tableId,
        'status': 'PAID',
        'total_amount': 230000.0,
        'payment_method': 'TRANSFER',
        'created_at': DateTime.now().subtract(const Duration(hours: 2)).toIso8601String(),
        'paid_at': DateTime.now().subtract(const Duration(hours: 1, minutes: 50)).toIso8601String(),
      },
    ];
=======
import '../../core/network/dio_client.dart';

class OrderApiService {
  final _dioClient = DioClient();

  Future<Map<String, dynamic>> placeOrder(
    String tableId,
    List<CartItem> items,
  ) async {
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

    return response.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> trackOrder(String trackingCode) async {
    final response = await _dioClient.dio.get('/orders/track/$trackingCode');
    return response.data['data'] as Map<String, dynamic>;
>>>>>>> Stashed changes
  }
}
