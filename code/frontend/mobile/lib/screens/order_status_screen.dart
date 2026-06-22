import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

class OrderStatusScreen extends StatelessWidget {
  const OrderStatusScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppColors.textPrimary),
        title: const Text('Trạng thái đơn hàng', style: AppTextStyles.title),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 8)],
              ),
              child: Column(
                children: [
                  const Text('Mã đơn hàng: #GP12345', style: AppTextStyles.body),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildStatusIcon('Mới', Icons.assignment, const Color(0xFF1E40AF), true),
                      _buildStatusIcon('Đang chuẩn bị', Icons.restaurant, const Color(0xFF92400E), false),
                      _buildStatusIcon('Đã phục vụ', Icons.check_circle, const Color(0xFF5B21B6), false),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Expanded(
              child: ListView(
                children: [
                  _buildOrderItem('Phở Bò Đặc Biệt', 'Mới', const Color(0xFF1E40AF)),
                  _buildOrderItem('Cơm Tấm Sườn Bì', 'Đang chuẩn bị', const Color(0xFF92400E)),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primaryDark,
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
          onPressed: () {
            Navigator.popUntil(context, (route) => route.isFirst);
          },
          child: const Text('Gọi thêm món', style: TextStyle(color: Colors.white)),
        ),
      ),
    );
  }

  Widget _buildStatusIcon(String label, IconData icon, Color color, bool active) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withValues(alpha: active ? 0.2 : 0.05),
            shape: BoxShape.circle,
            border: Border.all(color: active ? color : Colors.transparent),
          ),
          child: Icon(icon, color: active ? color : Colors.grey),
        ),
        const SizedBox(height: 8),
        Text(label, style: TextStyle(color: active ? color : Colors.grey, fontSize: 12)),
      ],
    );
  }

  Widget _buildOrderItem(String name, String status, Color statusColor) {
    return ListTile(
      title: Text(name, style: AppTextStyles.title.copyWith(fontSize: 16)),
      subtitle: Text('x1', style: AppTextStyles.body),
      trailing: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: statusColor.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(status, style: TextStyle(color: statusColor, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
