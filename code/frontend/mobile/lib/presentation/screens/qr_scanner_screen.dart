import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:image_picker/image_picker.dart';
import '../blocs/session/session_cubit.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  bool _isScanned = false;
  final MobileScannerController _controller = MobileScannerController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _scanFromGallery() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      final BarcodeCapture? capture = await _controller.analyzeImage(image.path);
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

  void _onDetect(BarcodeCapture capture) {
    if (_isScanned) return;
    
    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      if (barcode.rawValue != null) {
        final String rawValue = barcode.rawValue!;
        // Giả sử mã QR chứa trực tiếp UUID của table_id
        if (rawValue.length == 36) { 
          _isScanned = true;
          context.read<SessionCubit>().setTableId(rawValue);
          context.go('/main');
          break;
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Mã QR không hợp lệ. Vui lòng liên hệ nhân viên.')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Quét mã QR tại bàn')),
      body: MobileScanner(
        controller: _controller,
        onDetect: _onDetect,
      ),
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
              context.read<SessionCubit>().setTableId('da27133a-b8f9-45d1-9f21-4cba52e3d884');
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
