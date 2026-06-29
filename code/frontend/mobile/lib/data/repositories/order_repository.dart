import 'dart:async';
<<<<<<< Updated upstream
import 'dart:convert';
import '../models/order_model.dart';
import '../models/cart_item.dart';
import '../datasources/order_api_service.dart';
=======

import '../datasources/order_api_service.dart';
import '../models/cart_item.dart';
import '../models/order_model.dart';
>>>>>>> Stashed changes
import '../../core/network/websocket_client.dart';

class OrderRepository {
  final _apiService = OrderApiService();
  final _wsClient = WebSocketClient();

<<<<<<< Updated upstream
  Future<OrderModel> placeOrder(int tableId, List<CartItem> items, double totalAmount) async {
    final response = await _apiService.placeOrder(tableId, items, totalAmount);
    return OrderModel.fromJson(response);
  }

  Future<List<OrderModel>> getOrderHistory(int tableId) async {
    final response = await _apiService.getOrderHistory(tableId);
    return response.map((e) => OrderModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  /// Lắng nghe các sự kiện Realtime đẩy từ Server
  Stream<Map<String, dynamic>> get orderUpdatesStream {
    return _wsClient.stream.map((eventString) {
      try {
        return jsonDecode(eventString) as Map<String, dynamic>;
      } catch (e) {
        return {};
      }
    });
=======
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
>>>>>>> Stashed changes
  }
}
