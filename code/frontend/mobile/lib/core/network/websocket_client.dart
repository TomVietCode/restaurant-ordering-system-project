import 'dart:async';
import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:flutter/foundation.dart';

class WebSocketClient {
  WebSocketChannel? _channel;
  final StreamController<String> _streamController = StreamController<String>.broadcast();
  Timer? _mockTimer;

  static final WebSocketClient _instance = WebSocketClient._internal();
  factory WebSocketClient() => _instance;

  WebSocketClient._internal() {
    _initConnection();
  }

  void _initConnection() {
    final wsUrl = dotenv.env['WEBSOCKET_URL'];
    if (wsUrl != null && wsUrl.isNotEmpty) {
      try {
        _channel = WebSocketChannel.connect(Uri.parse(wsUrl));
        _channel!.stream.listen(
          (message) {
            _streamController.add(message.toString());
          },
          onError: (error) {
            debugPrint('WebSocket Error: $error');
            _startMockSimulation(); // Fallback to mock if connection fails
          },
          onDone: () {
            debugPrint('WebSocket Closed');
          },
        );
      } catch (e) {
        debugPrint('WebSocket Connection Exception: $e');
        _startMockSimulation();
      }
    } else {
      _startMockSimulation();
    }
  }

  // Fallback Simulation since the backend is not ready
  void _startMockSimulation() {
    _mockTimer?.cancel();
    _mockTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      // Simulate Backend sending an ORDER_UPDATED event
      final mockEvent = {
        'event': 'ORDER_UPDATED',
        'payload': {
          'status': 'PREPARING', // This will just trigger the BLOC to advance the state in our mock
        }
      };
      _streamController.add(jsonEncode(mockEvent));
    });
  }

  Stream<String> get stream => _streamController.stream;

  void dispose() {
    _mockTimer?.cancel();
    _channel?.sink.close();
    _streamController.close();
  }
}
