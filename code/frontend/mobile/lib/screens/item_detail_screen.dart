import 'package:flutter/material.dart';
import '../models/item_model.dart';
import '../theme/app_colors.dart';

class ItemDetailScreen extends StatefulWidget {
  final ItemModel item;
  
  const ItemDetailScreen({super.key, required this.item});

  @override
  State<ItemDetailScreen> createState() => _ItemDetailScreenState();
}

class _ItemDetailScreenState extends State<ItemDetailScreen> {
  int _quantity = 1;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Nội dung chính
          CustomScrollView(
            slivers: [
              // Ảnh món ăn với Gradient
              SliverAppBar(
                expandedHeight: 390,
                pinned: true,
                backgroundColor: Colors.white,
                iconTheme: const IconThemeData(color: AppColors.primaryDark),
                flexibleSpace: FlexibleSpaceBar(
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      Image.network(
                        widget.item.imagesUrl.isNotEmpty ? widget.item.imagesUrl.first : "https://placehold.co/390x390",
                        fit: BoxFit.cover,
                      ),
                      Positioned(
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 96,
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.bottomCenter,
                              end: Alignment.topCenter,
                              colors: [Colors.white, Colors.white.withValues(alpha: 0)],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              
              // Chi tiết món
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Tiêu đề & Giá
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  widget.item.name,
                                  style: const TextStyle(
                                    color: Color(0xFF201B16),
                                    fontSize: 24,
                                    fontFamily: 'Epilogue',
                                    fontWeight: FontWeight.w700,
                                    height: 1.33,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF2E6DE),
                                        borderRadius: BorderRadius.circular(9999),
                                      ),
                                      child: const Text('Phổ biến', style: TextStyle(color: Color(0xFF55423E), fontSize: 12)),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFE07A5F),
                                        borderRadius: BorderRadius.circular(9999),
                                      ),
                                      child: const Text('Must try', style: TextStyle(color: Color(0xFF5B1604), fontSize: 12)),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '${widget.item.price.toInt()}đ',
                            style: const TextStyle(
                              color: Color(0xFF9A442D),
                              fontSize: 24,
                              fontFamily: 'Epilogue',
                              fontWeight: FontWeight.w700,
                              height: 1.33,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      
                      // Mô tả
                      Text(
                        widget.item.description ?? '',
                        style: const TextStyle(
                          color: Color(0xFF55423E),
                          fontSize: 15,
                          fontFamily: 'Epilogue',
                          fontWeight: FontWeight.w400,
                          height: 1.47,
                        ),
                      ),
                      
                      const SizedBox(height: 24),
                      Container(height: 1, color: const Color(0xFFECE0D8)),
                      const SizedBox(height: 24),
                      
                      // Ghi chú cho đầu bếp
                      const Text(
                        'Ghi chú cho đầu bếp',
                        style: TextStyle(
                          color: Color(0xFF201B16),
                          fontSize: 18,
                          fontFamily: 'Epilogue',
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        decoration: InputDecoration(
                          hintText: 'VD: Không hành, ít bánh phở, nước béo...',
                          hintStyle: const TextStyle(color: Color(0x7F55423E), fontSize: 15),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: Color(0xFFDBC1BA)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: Color(0xFFDBC1BA)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: Color(0xFF9A442D)),
                          ),
                          contentPadding: const EdgeInsets.all(12),
                        ),
                        maxLines: 2,
                      ),
                      
                      const SizedBox(height: 24),
                      Container(height: 1, color: const Color(0xFFECE0D8)),
                      const SizedBox(height: 24),
                      
                      // Tăng giảm số lượng
                      Center(
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8ECE3),
                            borderRadius: BorderRadius.circular(9999),
                            border: Border.all(color: const Color(0xFFDBC1BA)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              GestureDetector(
                                onTap: () {
                                  if (_quantity > 1) setState(() => _quantity--);
                                },
                                child: Container(
                                  width: 40,
                                  height: 40,
                                  decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                                  child: const Icon(Icons.remove, color: Color(0xFF9A442D)),
                                ),
                              ),
                              SizedBox(
                                width: 40,
                                child: Text(
                                  '$_quantity',
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                    color: Color(0xFF201B16),
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              GestureDetector(
                                onTap: () {
                                  setState(() => _quantity++);
                                },
                                child: Container(
                                  width: 40,
                                  height: 40,
                                  decoration: const BoxDecoration(color: Color(0xFF9A442D), shape: BoxShape.circle),
                                  child: const Icon(Icons.add, color: Colors.white),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 120), // Padding cho Bottom Bar
                    ],
                  ),
                ),
              ),
            ],
          ),
          
          // Bottom Bar Thêm vào giỏ hàng
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.9),
                border: const Border(top: BorderSide(color: Color(0xFFECE0D8))),
                boxShadow: const [BoxShadow(color: Color(0x0C000000), blurRadius: 16, offset: Offset(0, -4))],
              ),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF9A442D),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(9999)),
                ),
                onPressed: () {
                  Navigator.pop(context);
                },
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.shopping_cart_outlined, color: Colors.white),
                    const SizedBox(width: 8),
                    Text(
                      'Thêm vào giỏ hàng - ${(_quantity * widget.item.price).toInt()}đ',
                      style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
