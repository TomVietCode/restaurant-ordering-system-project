import 'package:flutter/foundation.dart';

import '../network/dio_client.dart';

class TableInfo {
  final String id;
  final String name;
  final String status;

  const TableInfo({required this.id, required this.name, required this.status});

  bool get isClosed => status.toUpperCase() == 'CLOSED';
}

class TableMapper {
  static final Map<String, String> _nameCache = {};
  static final Map<String, TableInfo> _tableCache = {};

  /// Loads and caches the display name for a table UUID.
  static Future<String> loadTableName(String uuid) async {
    final table = await loadTable(uuid);
    if (table != null) return table.name;

    return 'Bàn $uuid';
  }

  /// Loads and caches public table metadata for QR/customer flows.
  static Future<TableInfo?> loadTable(String uuid) async {
    final key = uuid.toLowerCase();

    if (_tableCache.containsKey(key)) return _tableCache[key]!;

    try {
      final response = await DioClient().dio.get('/tables/$key');
      final data = response.data;
      final tableData = data is Map && data.containsKey('data')
          ? data['data']
          : data;

      if (tableData is! Map) return null;

      final id = (tableData['id'] ?? key).toString();
      final name = (tableData['name'] ?? '').toString();
      final status = (tableData['status'] ?? '').toString();

      if (name.isNotEmpty) {
        final table = TableInfo(id: id, name: name, status: status);
        _nameCache[key] = name;
        _tableCache[key] = table;
        return table;
      }
    } catch (error) {
      debugPrint('TableMapper: failed to load table $uuid: $error');
    }

    return null;
  }

  /// Returns the cached display name for use in synchronous widget builds.
  static String getTableName(String? uuid) {
    if (uuid == null) return 'Chưa chọn bàn';
    return _nameCache[uuid.toLowerCase()] ?? 'Đang tải...';
  }
}
