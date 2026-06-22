import 'package:flutter/material.dart';
import '../repositories/mock_data.dart';
import 'order_status_screen.dart';
import '../widgets/custom_bottom_nav.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cartItems = MockData.menuItems.take(2).toList();
    final total = cartItems.fold(0.0, (sum, item) => sum + item.price);

    return Scaffold(
      backgroundColor: const Color(0xFFFAF8F5),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        shadowColor: const Color(0x19000000),
        title: const Text(
          'Giỏ hàng',
          style: TextStyle(
            color: Color(0xFF201B16),
            fontSize: 24,
            fontFamily: 'Epilogue',
            fontWeight: FontWeight.w700,
          ),
        ),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          ListView.separated(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 200),
            itemCount: cartItems.length,
            separatorBuilder: (_, __) => const SizedBox(height: 16),
            itemBuilder: (context, index) {
              final item = cartItems[index];
              return Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.7),
                  border: Border.all(color: const Color(0x66E2DBD2)),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: const [BoxShadow(color: Color(0x19201B16), blurRadius: 12, offset: Offset(0, 4))],
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network(
                        item.imagesUrl.first,
                        width: 96,
                        height: 96,
                        fit: BoxFit.cover,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.name,
                            style: const TextStyle(
                              color: Color(0xFF201B16),
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Kèm canh súp và đồ chua', // Mock ghi chú
                            style: TextStyle(color: Color(0xFF55423E), fontSize: 13),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${item.price.toInt()}đ',
                                style: const TextStyle(
                                  color: Color(0xFF201B16),
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              // Bộ tăng giảm số lượng mini
                              Container(
                                height: 32,
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF8ECE3),
                                  borderRadius: BorderRadius.circular(9999),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.remove, size: 16, color: Color(0xFF9A442D)),
                                    const SizedBox(width: 12),
                                    const Text('1', style: TextStyle(fontWeight: FontWeight.bold)),
                                    const SizedBox(width: 12),
                                    Container(
                                      decoration: const BoxDecoration(color: Color(0xFF9A442D), shape: BoxShape.circle),
                                      padding: const EdgeInsets.all(2),
                                      child: const Icon(Icons.add, size: 14, color: Colors.white),
                                    ),
                                  ],
                                ),
                              )
                            ],
                          )
                        ],
                      ),
                    )
                  ],
                ),
              );
            },
          ),
          
          // Tổng tiền & Nút Đặt món
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                boxShadow: [BoxShadow(color: Color(0x19000000), blurRadius: 16, offset: Offset(0, -8))],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Tổng thanh toán', style: TextStyle(fontSize: 16, color: Color(0xFF55423E))),
                      Text('${total.toInt()}đ', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF9A442D))),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF9A442D),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const OrderStatusScreen()),
                        );
                      },
                      child: const Text('Đặt món ngay', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          )
        ],
      ),
      bottomNavigationBar: const CustomBottomNav(),
    );
  }
}
