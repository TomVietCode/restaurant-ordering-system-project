import '../network/dio_client.dart';

class TableMapper {
  static final Map<String, String> _cache = {};

  /// Lấy tên bàn từ UUID, gọi API GET /api/tables/{id} (public, không cần auth)
  static Future<String> loadTableName(String uuid) async {
    final key = uuid.toLowerCase();

    // Trả về từ cache nếu đã load trước đó
    if (_cache.containsKey(key)) return _cache[key]!;

    try {
      final response = await DioClient().dio.get('/tables/$key');
      final data = response.data;
      // Hỗ trợ cả { data: { name: ... } } và { name: ... }
      final tableData = data is Map && data.containsKey('data') ? data['data'] : data;
      final name = (tableData['name'] ?? '').toString();
      if (name.isNotEmpty) {
        _cache[key] = name;
        return name;
      }
    } catch (e) {
      print('TableMapper: Failed to load table $uuid: $e');
    }

    return 'Bàn $uuid';
  }

  /// Lấy tên bàn đồng bộ (từ cache), dùng trong Widget build()
  static String getTableName(String? uuid) {
    if (uuid == null) return 'Chưa chọn bàn';
    return _cache[uuid.toLowerCase()] ?? 'Đang tải...';
  }
}
