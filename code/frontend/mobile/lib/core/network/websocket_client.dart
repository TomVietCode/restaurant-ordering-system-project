import 'dart:async';
<<<<<<< Updated upstream
import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:flutter/foundation.dart';

class WebSocketClient {
  WebSocketChannel? _channel;
  final StreamController<String> _streamController = StreamController<String>.broadcast();
  Timer? _mockTimer;
=======

import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

class WebSocketClient {
  io.Socket? _socket;
  final StreamController<Map<String, dynamic>> _streamController =
      StreamController<Map<String, dynamic>>.broadcast();
  final Set<String> _trackingCodes = {};
>>>>>>> Stashed changes

  static final WebSocketClient _instance = WebSocketClient._internal();
  factory WebSocketClient() => _instance;

  WebSocketClient._internal() {
    _initConnection();
  }

  void _initConnection() {
<<<<<<< Updated upstream
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
=======
    final socketUrl = _resolveSocketUrl();
    if (socketUrl == null) {
      debugPrint('Socket.IO disabled: API_BASE_URL/WEBSOCKET_URL is empty');
      return;
    }

    _socket = io.io(
      socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .enableReconnection()
          .disableAutoConnect()
          .build(),
    );

    _socket!
      ..onConnect((_) {
        debugPrint('Socket.IO connected: $socketUrl');
        for (final trackingCode in _trackingCodes) {
          _emitJoinOrderTracking(trackingCode);
        }
      })
      ..onDisconnect((_) => debugPrint('Socket.IO disconnected'))
      ..onConnectError((error) => debugPrint('Socket.IO connect error: $error'))
      ..onError((error) => debugPrint('Socket.IO error: $error'))
      ..on('order:status-changed', (payload) {
        _addEvent('order:status-changed', payload);
      })
      ..on('order:new', (payload) {
        _addEvent('order:new', payload);
      })
      ..connect();
  }

  String? _resolveSocketUrl() {
    final explicitUrl = dotenv.env['WEBSOCKET_URL']?.trim();
    if (explicitUrl != null && explicitUrl.isNotEmpty) {
      return explicitUrl;
    }

    final apiBaseUrl = dotenv.env['API_BASE_URL']?.trim();
    if (apiBaseUrl == null || apiBaseUrl.isEmpty) {
      return null;
    }

    final baseUrl = apiBaseUrl.replaceFirst(RegExp(r'/api/?$'), '');
    return '$baseUrl/orders';
  }

  void _addEvent(String event, dynamic payload) {
    if (payload is! Map) return;
    _streamController.add({
      'event': event,
      'payload': Map<String, dynamic>.from(payload),
    });
  }

  void joinOrderTracking(String trackingCode) {
    if (trackingCode.isEmpty) return;
    _trackingCodes.add(trackingCode);
    if (_socket?.connected == true) {
      _emitJoinOrderTracking(trackingCode);
    }
  }

  void _emitJoinOrderTracking(String trackingCode) {
    _socket?.emit('join-order-tracking', {'trackingCode': trackingCode});
  }

  Stream<Map<String, dynamic>> get stream => _streamController.stream;

  void dispose() {
    _socket?.dispose();
>>>>>>> Stashed changes
    _streamController.close();
  }
}
