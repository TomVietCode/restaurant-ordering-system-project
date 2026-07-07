import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/utils/table_mapper.dart';
import '../../../data/models/order_item.dart';
import '../blocs/order/order_bloc.dart';
import '../blocs/order/order_event.dart';
import '../blocs/order/order_state.dart';
import '../blocs/session/session_cubit.dart';
import '../widgets/app_logo.dart';
import '../widgets/cancelled_order_banner.dart';
import '../widgets/history_action_button.dart';
import '../widgets/history_checkout_summary.dart';
import '../widgets/order_status_timeline.dart';
import '../widgets/ordered_item_card.dart';

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

  void _syncCancelledBanner(bool isCancelled) {
    if (isCancelled) {
      if (showCancelledBanner && _cancelledBannerTimer == null) {
        _cancelledBannerTimer = Timer(const Duration(seconds: 3), () {
          if (!mounted) return;
          setState(() {
            showCancelledBanner = false;
            _cancelledBannerTimer = null;
          });
        });
      }
      return;
    }

    _cancelledBannerTimer?.cancel();
    _cancelledBannerTimer = null;

    if (!showCancelledBanner) {
      setState(() => showCancelledBanner = true);
    } else {
      showCancelledBanner = true;
    }
  }

  @override
  Widget build(BuildContext context) {
    final tableId = context.watch<SessionCubit>().state;
    final displayTable = TableMapper.getTableName(tableId);

    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      appBar: AppBar(
        leading: const AppLogo(),
        title: Text(
          tableId != null ? displayTable : 'Lịch sử',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: BlocConsumer<OrderBloc, OrderState>(
        listenWhen: (previous, current) => previous.items != current.items,
        listener: (context, state) {
          _syncCancelledBanner(
            state.items.any((item) => item.status == OrderStatus.cancelled),
          );
        },
        builder: (context, state) {
          if (state.items.isEmpty) {
            return _EmptyHistory(onAddMore: widget.onAddMore);
          }

          return _HistoryContent(
            items: state.items,
            fallbackOrderCode: state.orderCode,
            displayTable: displayTable,
            showCheckout: showCheckout,
            showCancelledBanner: showCancelledBanner,
            onAddMore: _goToMenu,
            onCallStaff: () => _callStaff(context),
            onRequestCheckout: () => _requestCheckout(context, state.items),
            onConfirmPayment: () => _confirmPayment(context),
          );
        },
      ),
    );
  }

  void _goToMenu() {
    setState(() => showCheckout = false);
    widget.onAddMore();
  }

  void _callStaff(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Đã gửi yêu cầu gọi nhân viên!'),
        backgroundColor: Colors.orange,
      ),
    );
  }

  void _requestCheckout(BuildContext context, List<OrderItem> items) {
    final hasServed = items.any((item) => item.status == OrderStatus.served);
    if (!hasServed) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Chưa có món nào được phục vụ để thanh toán!'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => showCheckout = true);
  }

  void _confirmPayment(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Xác nhận thanh toán thành công!'),
        backgroundColor: Colors.green,
      ),
    );
    setState(() => showCheckout = false);
    context.read<OrderBloc>().add(ClearOrder());
    widget.onAddMore();
  }
}

class _EmptyHistory extends StatelessWidget {
  final VoidCallback onAddMore;

  const _EmptyHistory({required this.onAddMore});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.history, size: 80, color: Colors.grey[400]),
          const SizedBox(height: 16),
          const Text(
            'Chưa có lịch sử đặt món',
            style: TextStyle(fontSize: 18, color: Colors.grey),
          ),
          const SizedBox(height: 24),
          OutlinedButton(
            onPressed: onAddMore,
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0xFFD96B46)),
              foregroundColor: const Color(0xFFD96B46),
            ),
            child: const Text('Quay lại Menu'),
          ),
        ],
      ),
    );
  }
}

class _HistoryContent extends StatelessWidget {
  final List<OrderItem> items;
  final String fallbackOrderCode;
  final String displayTable;
  final bool showCheckout;
  final bool showCancelledBanner;
  final VoidCallback onAddMore;
  final VoidCallback onCallStaff;
  final VoidCallback onRequestCheckout;
  final VoidCallback onConfirmPayment;

  const _HistoryContent({
    required this.items,
    required this.fallbackOrderCode,
    required this.displayTable,
    required this.showCheckout,
    required this.showCancelledBanner,
    required this.onAddMore,
    required this.onCallStaff,
    required this.onRequestCheckout,
    required this.onConfirmPayment,
  });

  @override
  Widget build(BuildContext context) {
    final isCancelled = items.any(
      (item) => item.status == OrderStatus.cancelled,
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: 8),
          const Text(
            'Trạng thái đơn hàng',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 24),
          if (isCancelled && showCancelledBanner)
            const CancelledOrderBanner()
          else
            OrderStatusTimeline(activeStep: _activeStep),
          const SizedBox(height: 32),
          const Align(
            alignment: Alignment.centerLeft,
            child: Text(
              'Món đã đặt',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w900,
                color: Colors.black87,
              ),
            ),
          ),
          const SizedBox(height: 16),
          ...items.map(
            (item) => OrderedItemCard(
              item: item,
              fallbackOrderCode: fallbackOrderCode,
            ),
          ),
          const SizedBox(height: 32),
          if (!isCancelled) ...[
            HistoryActionButton(
              icon: Icons.add_circle_outline,
              label: 'Đặt thêm món',
              backgroundColor: const Color(0xFFDC7B5C),
              textColor: Colors.white,
              onPressed: onAddMore,
            ),
            const SizedBox(height: 12),
            HistoryActionButton(
              icon: Icons.notifications_active_outlined,
              label: 'Gọi nhân viên',
              backgroundColor: Colors.white,
              textColor: const Color(0xFFDC7B5C),
              borderColor: const Color(0xFFDC7B5C),
              onPressed: onCallStaff,
            ),
            const SizedBox(height: 12),
          ],
          if (!showCheckout)
            HistoryActionButton(
              icon: null,
              label: 'Yêu cầu thanh toán',
              backgroundColor: const Color(0xFF67A942),
              textColor: Colors.white,
              onPressed: onRequestCheckout,
            )
          else
            HistoryCheckoutSummary(
              items: items,
              displayTable: displayTable,
              onConfirmPayment: onConfirmPayment,
            ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  int get _activeStep {
    if (items.any((item) => item.status == OrderStatus.cancelled)) return -1;
    if (items.every((item) => item.status == OrderStatus.served)) return 2;
    if (items.any((item) => item.status == OrderStatus.preparing)) return 1;

    final hasServed = items.any((item) => item.status == OrderStatus.served);
    final hasPending = items.any((item) => item.status == OrderStatus.pending);
    return hasServed && hasPending ? 1 : 0;
  }
}
