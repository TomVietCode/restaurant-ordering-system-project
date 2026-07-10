import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_strings.dart';
import '../../../core/utils/table_mapper.dart';
import '../blocs/session/session_cubit.dart';
import '../blocs/cart/cart_bloc.dart';
import '../blocs/cart/cart_event.dart';
import '../blocs/order/order_bloc.dart';
import '../blocs/order/order_event.dart';

class LeaveTableAction extends StatelessWidget {
  const LeaveTableAction({super.key});

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.exit_to_app),
      tooltip: AppStrings.leaveTable,
      onPressed: () => _showConfirmDialog(context),
    );
  }

  void _showConfirmDialog(BuildContext context) {
    final tableId = context.read<SessionCubit>().state;
    final displayTable = tableId != null
        ? TableMapper.getTableName(tableId)
        : AppStrings.thisTable;

    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: const Text(AppStrings.leaveTableTitle),
          content: Text(AppStrings.leaveTableMessage(displayTable)),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text(
                AppStrings.cancel,
                style: TextStyle(color: Colors.grey),
              ),
            ),
            TextButton(
              onPressed: () {
                // Clear session and cart
                context.read<CartBloc>().add(ClearCart());
                context.read<OrderBloc>().add(ClearOrder());
                context.read<SessionCubit>().clearSession();

                // Pop dialog
                Navigator.of(dialogContext).pop();

                // Go to scanner
                context.go('/');
              },
              child: const Text(
                AppStrings.leaveTable,
                style: TextStyle(
                  color: Colors.red,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}
