import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class DioClient {
  late final Dio dio;

  static final DioClient _instance = DioClient._internal();
  factory DioClient() => _instance;

  DioClient._internal() {
    // Lấy Base URL từ file .env
    final baseUrl = dotenv.env['API_BASE_URL'] ?? '';

    dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        responseType: ResponseType.json,
      ),
    );

    // Cài đặt Interceptors (Các trạm kiểm soát)
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // Bổ sung Token hoặc Header đặc biệt vào đây
          return handler.next(options);
        },
        onResponse: (response, handler) {
          return handler.next(response);
        },
        onError: (DioException e, handler) {
          return handler.next(e);
        },
      ),
    );
  }
}
