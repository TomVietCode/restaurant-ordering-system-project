import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../blocs/session/session_cubit.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  bool _isScanned = false;

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
        onDetect: _onDetect,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // Bỏ qua phần cứng Camera để test trên Emulator
          context.read<SessionCubit>().setTableId('f47ac10b-58cc-4372-a567-0e02b2c3d479');
          context.go('/main');
        },
        icon: const Icon(Icons.skip_next),
        label: const Text('Skip (Dành cho Emulator)'),
      ),
    );
  }
}
