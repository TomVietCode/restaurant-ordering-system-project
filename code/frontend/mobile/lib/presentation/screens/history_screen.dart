import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/session/session_cubit.dart';
import '../blocs/order/order_bloc.dart';
import '../blocs/order/order_state.dart';
import '../blocs/order/order_event.dart';
import '../../../data/models/order_item.dart';
import '../../../core/utils/table_mapper.dart';

class HistoryScreen extends StatefulWidget {
  final VoidCallback onAddMore;

  const HistoryScreen({super.key, required this.onAddMore});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  bool showCheckout = false;
  bool showCancelledBanner = true;
  Timer? _cancelledBannerTimer;

  @override
  void dispose() {
    _cancelledBannerTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tableId = context.watch<SessionCubit>().state;
    final displayTable = TableMapper.getTableName(tableId);

    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.restaurant, color: Colors.black87),
          onPressed: () {},
        ),
        title: Text(displayTable, style: const TextStyle(color: Color(0xFFD96B46), fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: BlocBuilder<OrderBloc, OrderState>(
        builder: (context, state) {
          final items = state.items;

          if (items.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.history, size: 80, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  const Text('Chưa có lịch sử đặt món', style: TextStyle(fontSize: 18, color: Colors.grey)),
                  const SizedBox(height: 24),
                  OutlinedButton(
                    onPressed: widget.onAddMore,
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFFD96B46)),
                      foregroundColor: const Color(0xFFD96B46),
                    ),
                    child: const Text('Quay lại Menu'),
                  )
                ],
              ),
            );
          }

          final isCancelled = items.any((i) => i.status == OrderStatus.cancelled);

          if (isCancelled && showCancelledBanner && _cancelledBannerTimer == null) {
            _cancelledBannerTimer = Timer(const Duration(seconds: 3), () {
              if (mounted) {
                setState(() {
                  showCancelledBanner = false;
                  _cancelledBannerTimer = null;
                });
              }
            });
          } else if (!isCancelled) {
            _cancelledBannerTimer?.cancel();
            _cancelledBannerTimer = null;
            showCancelledBanner = true;
          }

          int activeStep = 0;
          if (isCancelled) {
            activeStep = -1;
          } else if (items.every((i) => i.status == OrderStatus.served)) {
            activeStep = 2;
          } else if (items.any((i) => i.status == OrderStatus.preparing)) {
            activeStep = 1;
          } else if (items.any((i) => i.status == OrderStatus.served) && items.any((i) => i.status == OrderStatus.pending)) {
            activeStep = 1;
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 8),
                const Text('Trạng thái đơn hàng', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.black87)),
                const SizedBox(height: 4),
                Text('Mã đơn hàng: #${state.orderId}', style: TextStyle(fontSize: 14, color: Colors.grey[600])),
                const SizedBox(height: 24),

                if (isCancelled && showCancelledBanner)
                  Container(
                    width: double.infinity,
                    margin: const EdgeInsets.only(bottom: 24),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFEBEB),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.red.shade200),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.cancel, color: Colors.red, size: 28),
                        SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Đơn hàng đã bị hủy', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.red)),
                              SizedBox(height: 4),
                              Text('Vui lòng liên hệ nhân viên nếu cần hỗ trợ.', style: TextStyle(fontSize: 13, color: Colors.red)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  _buildTimeline(activeStep),

                const SizedBox(height: 32),
                const Align(
                  alignment: Alignment.centerLeft,
                  child: Text('Món đã đặt', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.black87)),
                ),
                const SizedBox(height: 16),

                ...items.map((item) {
                  return _buildOrderedItem(
                    name: item.product.name,
                    price: '${(item.product.price * item.quantity).toInt()}đ',
                    quantity: 'x${item.quantity}',
                    notes: item.notes,
                    imageUrl: item.product.imagesUrl.isNotEmpty ? item.product.imagesUrl.first : '',
                    status: item.status,
                  );
                }),
                
                const SizedBox(height: 32),
                
                if (!isCancelled) ...[
                  _buildActionButton(
                    icon: Icons.add_circle_outline,
                    label: 'Đặt thêm món',
                    backgroundColor: const Color(0xFFDC7B5C),
                    textColor: Colors.white,
                    onPressed: () {
                      setState(() { showCheckout = false; });
                      widget.onAddMore();
                    },
                  ),
                  const SizedBox(height: 12),
                  _buildActionButton(
                    icon: Icons.notifications_active_outlined,
                    label: 'Gọi nhân viên',
                    backgroundColor: Colors.white,
                    textColor: const Color(0xFFDC7B5C),
                    borderColor: const Color(0xFFDC7B5C),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Đã gửi yêu cầu gọi nhân viên!'), backgroundColor: Colors.orange),
                      );
                    },
                  ),
                  const SizedBox(height: 12),
                ],
                
                if (!showCheckout)
                  _buildActionButton(
                    icon: null,
                    label: 'Yêu cầu thanh toán',
                    backgroundColor: const Color(0xFF67A942),
                    textColor: Colors.white,
                    onPressed: () {
                      final hasServed = items.any((i) => i.status == OrderStatus.served);
                      if (!hasServed) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Chưa có món nào được phục vụ để thanh toán!'), backgroundColor: Colors.red),
                        );
                        return;
                      }
                      setState(() {
                        showCheckout = true;
                      });
                    },
                  )
                else
                  _buildCheckoutSummary(context, items, displayTable),

                const SizedBox(height: 32),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildCheckoutSummary(BuildContext context, List<OrderItem> items, String displayTable) {
    final servedItems = items.where((i) => i.status == OrderStatus.served).toList();
    final totalServedItems = servedItems.fold(0, (sum, item) => sum + item.quantity);
    final subtotal = servedItems.fold(0.0, (sum, item) => sum + (item.product.price * item.quantity));
    final vat = subtotal * 0.08;
    final total = subtotal + vat;

    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Tạm tính ($totalServedItems món)', style: const TextStyle(fontSize: 16, color: Colors.grey)),
              Text('${subtotal.toInt()}đ', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.black87)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('VAT (8%)', style: TextStyle(fontSize: 16, color: Colors.grey)),
              Text('${vat.toInt()}đ', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.black87)),
            ],
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Divider(thickness: 1, color: Color(0xFFEEEEEE)),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Tổng cộng', style: TextStyle(fontSize: 16, color: Colors.grey)),
                  const SizedBox(height: 4),
                  Text('Đặt cho $displayTable', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF9A442D))),
                ],
              ),
              Text('${total.toInt()}đ', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF9A442D))),
            ],
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4A3428),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Xác nhận thanh toán thành công!'), backgroundColor: Colors.green),
                );
                setState(() { showCheckout = false; });
                context.read<OrderBloc>().add(ClearOrder());
                widget.onAddMore(); // Về trang chủ
              },
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Xác nhận thanh toán', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  SizedBox(width: 8),
                  Icon(Icons.arrow_forward),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeline(int activeStep) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Positioned(
            top: 20,
            left: 40,
            right: 40,
            child: Container(height: 2, color: Colors.grey[300]),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildTimelineStep(Icons.receipt_long, 'Mới', const Color(0xFFE3EFFF), const Color(0xFF0056D2), isActive: activeStep == 0),
              _buildTimelineStep(Icons.soup_kitchen, 'Đang\nchuẩn bị', const Color(0xFFFFF2D1), const Color(0xFFA15C00), isActive: activeStep == 1),
              _buildTimelineStep(Icons.room_service, 'Đã phục vụ', const Color(0xFFEFE5FF), const Color(0xFF551FFF), isActive: activeStep == 2),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineStep(IconData icon, String label, Color bgColor, Color iconColor, {bool isActive = false}) {
    return Column(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(12),
            border: isActive ? Border.all(color: iconColor, width: 2) : null,
          ),
          child: Icon(icon, color: iconColor),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: iconColor,
          ),
        ),
      ],
    );
  }

  Widget _buildOrderedItem({
    required String name,
    required String price,
    required String quantity,
    required String? notes,
    required String imageUrl,
    required OrderStatus status,
  }) {
    Color badgeBgColor;
    Color badgeIconColor;
    IconData badgeIcon;

    if (status == OrderStatus.cancelled) {
      badgeBgColor = const Color(0xFFFFEBEB);
      badgeIconColor = Colors.red;
      badgeIcon = Icons.cancel;
    } else if (status == OrderStatus.pending) {
      badgeBgColor = const Color(0xFFE3EFFF);
      badgeIconColor = const Color(0xFF0056D2);
      badgeIcon = Icons.receipt_long;
    } else if (status == OrderStatus.preparing) {
      badgeBgColor = const Color(0xFFFFF2D1);
      badgeIconColor = const Color(0xFFA15C00);
      badgeIcon = Icons.soup_kitchen;
    } else {
      badgeBgColor = const Color(0xFFEFE5FF);
      badgeIconColor = const Color(0xFF551FFF);
      badgeIcon = Icons.room_service;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade100),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8, offset: const Offset(0, 4))],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: imageUrl.isNotEmpty
                ? Image.network(imageUrl, width: 70, height: 70, fit: BoxFit.cover)
                : Container(width: 70, height: 70, color: Colors.grey[200], child: const Icon(Icons.fastfood, color: Colors.grey)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87), maxLines: 2, overflow: TextOverflow.ellipsis),
                    ),
                    const SizedBox(width: 8),
                    Text(price, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.black87)),
                  ],
                ),
                const SizedBox(height: 4),
                if (notes != null && notes.isNotEmpty) ...[
                  Text(notes, style: const TextStyle(fontSize: 12, color: Colors.redAccent, fontStyle: FontStyle.italic)),
                  const SizedBox(height: 4),
                ],
                Text(quantity, style: TextStyle(fontSize: 14, color: Colors.grey[600])),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: badgeBgColor,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(badgeIcon, color: badgeIconColor, size: 16),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required IconData? icon,
    required String label,
    required Color backgroundColor,
    required Color textColor,
    Color? borderColor,
    required VoidCallback onPressed,
  }) {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: backgroundColor,
          foregroundColor: textColor,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: borderColor != null ? BorderSide(color: borderColor, width: 1.5) : BorderSide.none,
          ),
        ),
        onPressed: onPressed,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 20),
              const SizedBox(width: 8),
            ],
            Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
