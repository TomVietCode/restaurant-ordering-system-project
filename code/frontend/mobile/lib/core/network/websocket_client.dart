import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

class WebSocketClient {
  io.Socket? _socket;
  final StreamController<Map<String, dynamic>> _streamController =
      StreamController<Map<String, dynamic>>.broadcast();
  final Set<String> _trackingCodes = {};

  static final WebSocketClient _instance = WebSocketClient._internal();
  factory WebSocketClient() => _instance;

  WebSocketClient._internal() {
    _initConnection();
  }

  void _initConnection() {
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
    _streamController.close();
  }
}
