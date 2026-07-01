import 'dart:async';
import 'dart:io';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:image/image.dart' as img;
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/utils/table_mapper.dart';
import '../blocs/session/session_cubit.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  static final RegExp _uuidRegExp = RegExp(
    r'[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}',
  );

  bool _isScanned = false;
  DateTime? _lastInvalidMessageAt;
  final MobileScannerController _controller = MobileScannerController(
    formats: const [BarcodeFormat.qrCode],
  );

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _scanFromGallery() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      final BarcodeCapture? capture = await _analyzeQrImage(image.path);
      if (capture != null && capture.barcodes.isNotEmpty) {
        _onDetect(capture);
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không tìm thấy mã QR trong ảnh.')),
        );
      }
    }
  }

  Future<BarcodeCapture?> _analyzeQrImage(String imagePath) async {
    final BarcodeCapture? originalCapture = await _controller.analyzeImage(
      imagePath,
      formats: const [BarcodeFormat.qrCode],
    );
    if (originalCapture != null && originalCapture.barcodes.isNotEmpty) {
      return originalCapture;
    }

    final paddedImagePath = await _createQrImageWithQuietZone(imagePath);
    if (paddedImagePath == null) return originalCapture;

    return _controller.analyzeImage(
      paddedImagePath,
      formats: const [BarcodeFormat.qrCode],
    );
  }

  Future<String?> _createQrImageWithQuietZone(String imagePath) async {
    try {
      final bytes = await File(imagePath).readAsBytes();
      final decoded = img.decodeImage(bytes);
      if (decoded == null) return null;

      final source = img.bakeOrientation(decoded);
      final shortestSide = math.min(source.width, source.height);
      final padding = (shortestSide * 0.15).ceil().clamp(32, 160);
      final canvas = img.Image(
        width: source.width + padding * 2,
        height: source.height + padding * 2,
      );

      img.fill(canvas, color: img.ColorRgb8(255, 255, 255));
      img.compositeImage(canvas, source, dstX: padding, dstY: padding);

      final output = File(
        '${Directory.systemTemp.path}/qr_quiet_zone_${DateTime.now().microsecondsSinceEpoch}.png',
      );
      await output.writeAsBytes(img.encodePng(canvas));
      return output.path;
    } catch (_) {
      return null;
    }
  }

  void _onDetect(BarcodeCapture capture) {
    if (_isScanned) return;

    for (final barcode in capture.barcodes) {
      final String? tableId = _extractTableId(barcode.rawValue);
      if (tableId != null) {
        _openTable(tableId);
        return;
      }
    }

    _showInvalidQrMessage();
  }

  String? _extractTableId(String? rawValue) {
    if (rawValue == null) return null;

    final match = _uuidRegExp.firstMatch(rawValue.trim());
    return match?.group(0)?.toLowerCase();
  }

  void _openTable(String tableId) async {
    _isScanned = true;
    unawaited(_controller.stop());
    if (!mounted) return;

    // Load tên bàn từ API public trước khi chuyển màn hình
    await TableMapper.loadTableName(tableId);

    if (!mounted) return;
    context.read<SessionCubit>().setTableId(tableId);
    context.go('/main');
  }

  void _showInvalidQrMessage() {
    final now = DateTime.now();
    if (_lastInvalidMessageAt != null &&
        now.difference(_lastInvalidMessageAt!) < const Duration(seconds: 2)) {
      return;
    }

    _lastInvalidMessageAt = now;
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Mã QR không hợp lệ. Vui lòng liên hệ nhân viên.'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Quét mã QR tại bàn')),
      body: MobileScanner(controller: _controller, onDetect: _onDetect),
      floatingActionButton: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton.extended(
            heroTag: 'gallery',
            onPressed: _scanFromGallery,
            icon: const Icon(Icons.image),
            label: const Text('Chọn ảnh QR'),
          ),
          const SizedBox(height: 16),
          FloatingActionButton.extended(
            heroTag: 'skip',
            onPressed: () {
              // Bỏ qua phần cứng Camera để test trên Emulator
              context.read<SessionCubit>().setTableId(
                'da27133a-b8f9-45d1-9f21-4cba52e3d884',
              );
              context.go('/main');
            },
            icon: const Icon(Icons.skip_next),
            label: const Text('Skip (Dành cho Emulator)'),
          ),
        ],
      ),
    );
  }
}
