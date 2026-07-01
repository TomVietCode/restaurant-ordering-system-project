import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/utils/table_mapper.dart';
import '../../../data/models/cart_item.dart';
import '../blocs/cart/cart_bloc.dart';
import '../blocs/cart/cart_event.dart';
import '../blocs/cart/cart_state.dart';
import '../blocs/order/order_bloc.dart';
import '../blocs/order/order_event.dart';
import '../blocs/order/order_state.dart';
import '../blocs/session/session_cubit.dart';
import '../widgets/food_image.dart';
import '../../../core/utils/currency_formatter.dart';

class CartScreen extends StatelessWidget {
  final VoidCallback onOrderSuccess;

  const CartScreen({super.key, required this.onOrderSuccess});

  @override
  Widget build(BuildContext context) {
    final tableId = context.watch<SessionCubit>().state;
    final displayTable = TableMapper.getTableName(tableId);

    return BlocListener<OrderBloc, OrderState>(
      listenWhen: (previous, current) =>
          previous.isSubmitting && !current.isSubmitting,
      listener: (context, state) {
        if (state.errorMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.errorMessage!),
              backgroundColor: Colors.red,
            ),
          );
          return;
        }

        if (state.trackingCode.isNotEmpty) {
          context.read<CartBloc>().add(ClearCart());
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Đặt món thành công. Mã theo dõi: ${state.trackingCode}',
              ),
              backgroundColor: Colors.green,
            ),
          );
          onOrderSuccess();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF7F7F7),
        appBar: AppBar(
          leading: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Container(
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white,
              ),
              clipBehavior: Clip.antiAlias,
              child: Image.asset(
                'assets/images/logo.png',
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) =>
                    const Icon(Icons.restaurant, color: Colors.orange),
              ),
            ),
          ),
          title: const Text(
            'Giỏ hàng',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
        body: BlocBuilder<CartBloc, CartState>(
          builder: (context, cartState) {
            if (cartState.items.isEmpty) {
              return _EmptyCart(onAddMore: onOrderSuccess);
            }

            final totalItems = cartState.items.fold(
              0,
              (sum, item) => sum + item.quantity,
            );
            final subtotal = cartState.totalAmount;
            final vat = subtotal * 0.08;
            final total = subtotal + vat;

            return Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        ...cartState.items.map(
                          (item) => _buildCartItem(context, item),
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: OutlinedButton.icon(
                            onPressed: onOrderSuccess,
                            icon: const Icon(
                              Icons.add_circle_outline,
                              color: Color(0xFF9A442D),
                            ),
                            label: const Text(
                              'Thêm món khác',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF9A442D),
                              ),
                            ),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(
                                color: Color(0xFF9A442D),
                                width: 1.5,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                _CheckoutPanel(
                  tableId: tableId,
                  displayTable: displayTable,
                  totalItems: totalItems,
                  subtotal: subtotal,
                  vat: vat,
                  total: total,
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildCartItem(BuildContext context, CartItem item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: item.product.imagesUrl.isNotEmpty
                ? FoodImage(
                    imageUrl: item.product.imagesUrl.first,
                    width: 80,
                    height: 80,
                    fit: BoxFit.cover,
                  )
                : _imageFallback(),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.product.name,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                if (item.notes != null && item.notes!.isNotEmpty)
                  Text(
                    item.notes!,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Colors.redAccent,
                      fontStyle: FontStyle.italic,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  )
                else if (item.product.description != null)
                  Text(
                    item.product.description!,
                    style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      item.product.price.toVND(),
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: Colors.black87,
                      ),
                    ),
                    _QuantityStepper(item: item),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _imageFallback() {
    return const FoodImage(imageUrl: null, width: 80, height: 80);
  }
}

class _EmptyCart extends StatelessWidget {
  final VoidCallback onAddMore;

  const _EmptyCart({required this.onAddMore});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shopping_cart_outlined, size: 80, color: Colors.grey[400]),
          const SizedBox(height: 16),
          const Text(
            'Giỏ hàng đang trống',
            style: TextStyle(fontSize: 18, color: Colors.grey),
          ),
          const SizedBox(height: 24),
          OutlinedButton.icon(
            onPressed: onAddMore,
            icon: const Icon(Icons.add, color: Color(0xFF9A442D)),
            label: const Text(
              'Thêm món mới',
              style: TextStyle(color: Color(0xFF9A442D)),
            ),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0xFF9A442D)),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _QuantityStepper extends StatelessWidget {
  final CartItem item;

  const _QuantityStepper({required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          InkWell(
            onTap: () {
              context.read<CartBloc>().add(
                UpdateCartItemQuantity(
                  product: item.product,
                  notes: item.notes,
                  newQuantity: item.quantity - 1,
                ),
              );
            },
            child: const Padding(
              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              child: Text(
                '-',
                style: TextStyle(
                  color: Color(0xFF9A442D),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          Text(
            '${item.quantity}',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          InkWell(
            onTap: () {
              context.read<CartBloc>().add(
                UpdateCartItemQuantity(
                  product: item.product,
                  notes: item.notes,
                  newQuantity: item.quantity + 1,
                ),
              );
            },
            child: const Padding(
              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              child: Text(
                '+',
                style: TextStyle(
                  color: Color(0xFF9A442D),
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CheckoutPanel extends StatelessWidget {
  final String? tableId;
  final String displayTable;
  final int totalItems;
  final double subtotal;
  final double vat;
  final double total;

  const _CheckoutPanel({
    required this.tableId,
    required this.displayTable,
    required this.totalItems,
    required this.subtotal,
    required this.vat,
    required this.total,
  });

  @override
  Widget build(BuildContext context) {
    final orderState = context.watch<OrderBloc>().state;

    return Container(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 10,
            offset: Offset(0, -5),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _summaryRow('Tạm tính ($totalItems món)', subtotal.toVND()),
          const SizedBox(height: 12),
          _summaryRow('VAT (8%)', vat.toVND()),
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
                  const Text(
                    'Tổng cộng',
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Đặt cho $displayTable',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF9A442D),
                    ),
                  ),
                ],
              ),
              Text(
                total.toVND(),
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF9A442D),
                ),
              ),
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
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              onPressed: orderState.isSubmitting
                  ? null
                  : () => _submitOrder(context),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (orderState.isSubmitting) ...[
                    const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 10),
                  ],
                  Text(
                    orderState.isSubmitting
                        ? 'Đang gửi đơn...'
                        : 'Xác nhận đặt món',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.arrow_forward),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _summaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 16, color: Colors.grey)),
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.black87,
          ),
        ),
      ],
    );
  }

  void _submitOrder(BuildContext context) {
    final cartItems = context.read<CartBloc>().state.items;
    if (cartItems.isEmpty) return;

    if (tableId == null || tableId!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng quét mã QR bàn trước khi đặt món.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    context.read<OrderBloc>().add(PlaceOrder(tableId!, cartItems));
  }
}
