import 'dart:async';

import '../../core/network/websocket_client.dart';
import '../datasources/order_api_service.dart';
import '../models/cart_item.dart';
import '../models/order_model.dart';

class OrderRepository {
  final _apiService = OrderApiService();
  final _wsClient = WebSocketClient();

  Future<OrderModel> placeOrder(String tableId, List<CartItem> items) async {
    final response = await _apiService.placeOrder(tableId, items);
    return OrderModel.fromJson(response);
  }

  Future<OrderModel> trackOrder(String trackingCode) async {
    final response = await _apiService.trackOrder(trackingCode);
    return OrderModel.fromJson(response);
  }

  void joinOrderTracking(String trackingCode) {
    _wsClient.joinOrderTracking(trackingCode);
  }

  Stream<Map<String, dynamic>> get orderUpdatesStream {
    return _wsClient.stream;
  }
}
