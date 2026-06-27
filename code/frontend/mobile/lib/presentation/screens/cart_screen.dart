import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/models/cart_item.dart';
import '../blocs/cart/cart_bloc.dart';
import '../blocs/cart/cart_event.dart';
import '../blocs/cart/cart_state.dart';
import '../blocs/session/session_cubit.dart';
import '../blocs/order/order_bloc.dart';
import '../blocs/order/order_event.dart';
import '../../../core/utils/table_mapper.dart';

class CartScreen extends StatelessWidget {
  final VoidCallback onOrderSuccess;

  const CartScreen({super.key, required this.onOrderSuccess});

  @override
  Widget build(BuildContext context) {
    final tableId = context.watch<SessionCubit>().state;
    final displayTable = TableMapper.getTableName(tableId);

    return Scaffold(
      backgroundColor: const Color(0xFFF7F7F7),
      appBar: AppBar(
        title: const Text('Giỏ hàng', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: Colors.black,
      ),
      body: BlocBuilder<CartBloc, CartState>(
        builder: (context, state) {
          if (state.items.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shopping_cart_outlined, size: 80, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  const Text('Giỏ hàng đang trống', style: TextStyle(fontSize: 18, color: Colors.grey)),
                  const SizedBox(height: 24),
                  OutlinedButton.icon(
                    onPressed: onOrderSuccess,
                    icon: const Icon(Icons.add, color: Color(0xFF9A442D)),
                    label: const Text('Thêm món mới', style: TextStyle(color: Color(0xFF9A442D))),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFF9A442D)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  )
                ],
              ),
            );
          }

          int totalItems = state.items.fold(0, (sum, item) => sum + item.quantity);
          double subtotal = state.totalAmount;
          double vat = subtotal * 0.08;
          double total = subtotal + vat;

          return Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      ...state.items.map((item) => _buildCartItem(context, item)),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: OutlinedButton.icon(
                          onPressed: onOrderSuccess,
                          icon: const Icon(Icons.add_circle_outline, color: Color(0xFF9A442D)),
                          label: const Text('Thêm món khác', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF9A442D))),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: const Color(0xFF9A442D).withOpacity(0.5), width: 1.5),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            backgroundColor: Colors.transparent,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                  boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -5))],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildSummaryRow('Tạm tính ($totalItems món)', '${subtotal.toInt()}đ'),
                    const SizedBox(height: 12),
                    _buildSummaryRow('VAT (8%)', '${vat.toInt()}đ'),
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
                          final cartItems = context.read<CartBloc>().state.items;
                          if (cartItems.isEmpty) return;
                          
                          context.read<OrderBloc>().add(PlaceOrder(tableId ?? '0', cartItems));
                          context.read<CartBloc>().add(ClearCart());
                          
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Xác nhận đặt món thành công!'), backgroundColor: Colors.green),
                          );
                          onOrderSuccess();
                        },
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text('Xác nhận đặt món', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            SizedBox(width: 8),
                            Icon(Icons.arrow_forward),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              )
            ],
          );
        },
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 16, color: Colors.grey)),
        Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.black87)),
      ],
    );
  }

  Widget _buildCartItem(BuildContext context, CartItem item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 4))],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: item.product.imagesUrl.isNotEmpty
                ? Image.network(item.product.imagesUrl.first, width: 80, height: 80, fit: BoxFit.cover)
                : Container(width: 80, height: 80, color: Colors.grey[200], child: const Icon(Icons.fastfood, color: Colors.grey)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        item.product.name,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (item.product.price >= 80000)
                      Container(
                        margin: const EdgeInsets.only(left: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(4)),
                        child: const Text('Bestseller', style: TextStyle(fontSize: 10, color: Colors.black54, fontWeight: FontWeight.w600)),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                if (item.notes != null && item.notes!.isNotEmpty)
                  Text(
                    item.notes!,
                    style: const TextStyle(fontSize: 14, color: Colors.redAccent, fontStyle: FontStyle.italic),
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
                      '${item.product.price.toInt()}đ',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.black87),
                    ),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        children: [
                          InkWell(
                            onTap: () {
                              context.read<CartBloc>().add(UpdateCartItemQuantity(product: item.product, notes: item.notes, newQuantity: item.quantity - 1));
                            },
                            child: const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              child: Text('—', style: TextStyle(color: Color(0xFF9A442D), fontWeight: FontWeight.bold)),
                            ),
                          ),
                          Text('${item.quantity}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          InkWell(
                            onTap: () {
                              context.read<CartBloc>().add(UpdateCartItemQuantity(product: item.product, notes: item.notes, newQuantity: item.quantity + 1));
                            },
                            child: const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              child: Text('+', style: TextStyle(color: Color(0xFF9A442D), fontWeight: FontWeight.bold, fontSize: 18)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
