import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_strings.dart';
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
import '../widgets/leave_table_action.dart';

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
          tableId != null ? displayTable : AppStrings.historyTitle,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: const [LeaveTableAction()],
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

  void _requestCheckout(BuildContext context, List<OrderItem> items) {
    final hasServed = items.any((item) => item.status == OrderStatus.served);
    if (!hasServed) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(AppStrings.noServedItemsForCheckout),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => showCheckout = true);
  }

  void _confirmPayment(BuildContext context) {
    setState(() => showCheckout = false);
    context.read<OrderBloc>().add(ClearOrder());
    context.read<SessionCubit>().clearSession(); // Clear session

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 24.0,
              vertical: 40.0,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        color: const Color(0xFFFDECE6),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: const Color(0xFFD96B46),
                          width: 3,
                        ),
                      ),
                    ),
                    Container(
                      width: 50,
                      height: 50,
                      decoration: const BoxDecoration(
                        color: Color(0xFFD96B46),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.check,
                        color: Colors.white,
                        size: 30,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                const Text(
                  AppStrings.thanksForOrdering,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  AppStrings.seeYouAgain,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    fontStyle: FontStyle.italic,
                    color: Color(0xFF5A7A8D),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );

    Future.delayed(const Duration(seconds: 3), () {
      if (!context.mounted) return;

      // Pop the dialog if it's still showing
      if (Navigator.of(context, rootNavigator: true).canPop()) {
        Navigator.of(context, rootNavigator: true).pop();
      }
      // Go to QR scanner screen
      context.go('/');
    });
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
            AppStrings.emptyHistory,
            style: TextStyle(fontSize: 18, color: Colors.grey),
          ),
          const SizedBox(height: 24),
          OutlinedButton(
            onPressed: onAddMore,
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0xFFD96B46)),
              foregroundColor: const Color(0xFFD96B46),
            ),
            child: const Text(AppStrings.backToMenu),
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
  final VoidCallback onRequestCheckout;
  final VoidCallback onConfirmPayment;

  const _HistoryContent({
    required this.items,
    required this.fallbackOrderCode,
    required this.displayTable,
    required this.showCheckout,
    required this.showCancelledBanner,
    required this.onAddMore,
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
            AppStrings.orderStatus,
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
              AppStrings.orderedItems,
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
              label: AppStrings.addMoreItems,
              backgroundColor: const Color(0xFFDC7B5C),
              textColor: Colors.white,
              onPressed: onAddMore,
            ),
            const SizedBox(height: 12),
          ],
          if (!showCheckout)
            HistoryActionButton(
              icon: null,
              label: AppStrings.requestCheckout,
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
