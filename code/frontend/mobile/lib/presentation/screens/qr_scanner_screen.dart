import 'dart:async';
import 'dart:io';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:image/image.dart' as img;
import 'package:image_picker/image_picker.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../core/constants/app_strings.dart';
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

  final MobileScannerController _controller = MobileScannerController(
    formats: const [BarcodeFormat.qrCode],
  );

  bool _isScanned = false;
  bool _isPickingImage = false;
  DateTime? _lastInvalidMessageAt;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _scanFromGallery() async {
    if (_isPickingImage || _isScanned) return;

    setState(() => _isPickingImage = true);

    try {
      final picker = ImagePicker();
      final image = await picker.pickImage(source: ImageSource.gallery);
      if (image == null) return;

      final capture = await _analyzeQrImage(image.path);
      if (!mounted) return;

      if (capture != null && capture.barcodes.isNotEmpty) {
        _onDetect(capture);
        return;
      }

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text(AppStrings.noQrFound)));
    } finally {
      if (mounted) {
        setState(() => _isPickingImage = false);
      }
    }
  }

  Future<BarcodeCapture?> _analyzeQrImage(String imagePath) async {
    final originalCapture = await _controller.analyzeImage(
      imagePath,
      formats: const [BarcodeFormat.qrCode],
    );
    if (originalCapture != null && originalCapture.barcodes.isNotEmpty) {
      return originalCapture;
    }

    final paddedImagePath = await _createQrImageWithQuietZone(imagePath);
    if (paddedImagePath == null) return originalCapture;

    try {
      return await _controller.analyzeImage(
        paddedImagePath,
        formats: const [BarcodeFormat.qrCode],
      );
    } finally {
      unawaited(_deleteTempFile(paddedImagePath));
    }
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

  Future<void> _deleteTempFile(String path) async {
    try {
      await File(path).delete();
    } catch (_) {
      // Best-effort cleanup for temporary QR images.
    }
  }

  void _onDetect(BarcodeCapture capture) {
    if (_isScanned) return;

    for (final barcode in capture.barcodes) {
      final tableId = _extractTableId(barcode.rawValue);
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

    final table = await TableMapper.loadTable(tableId);

    if (!mounted) return;

    if (table == null) {
      await _showMissingTableDialog();
      _resetScanner();
      return;
    }

    if (table.isClosed) {
      await _showClosedTableDialog(table.name);
      _resetScanner();
      return;
    }

    context.read<SessionCubit>().setTableId(tableId);
    context.go('/main');
  }

  void _resetScanner() {
    _isScanned = false;
    unawaited(_controller.start());
  }

  Future<void> _showClosedTableDialog(String tableName) {
    return showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text(AppStrings.closedTableTitle),
        content: Text(AppStrings.closedTableMessage(tableName)),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text(AppStrings.gotIt),
          ),
        ],
      ),
    );
  }

  Future<void> _showMissingTableDialog() {
    return showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text(AppStrings.missingTableTitle),
        content: const Text(AppStrings.missingTableMessage),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text(AppStrings.gotIt),
          ),
        ],
      ),
    );
  }

  void _showInvalidQrMessage() {
    final now = DateTime.now();
    if (_lastInvalidMessageAt != null &&
        now.difference(_lastInvalidMessageAt!) < const Duration(seconds: 2)) {
      return;
    }

    _lastInvalidMessageAt = now;
    if (!mounted) return;

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text(AppStrings.invalidQr)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text(AppStrings.qrScannerTitle)),
      body: MobileScanner(controller: _controller, onDetect: _onDetect),
      floatingActionButton: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton.extended(
            heroTag: 'gallery',
            onPressed: _isPickingImage ? null : _scanFromGallery,
            icon: _isPickingImage
                ? const SizedBox.square(
                    dimension: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.image),
            label: Text(
              _isPickingImage ? AppStrings.scanning : AppStrings.chooseQrImage,
            ),
          ),
        ],
      ),
    );
  }
}
