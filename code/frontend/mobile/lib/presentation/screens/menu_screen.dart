import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/utils/table_mapper.dart';
import '../../../data/models/product.dart';
import '../blocs/menu/menu_bloc.dart';
import '../blocs/menu/menu_event.dart';
import '../blocs/menu/menu_state.dart';
import '../blocs/session/session_cubit.dart';
import '../widgets/app_logo.dart';
import '../widgets/food_search_delegate.dart';
import '../widgets/menu_category_tabs.dart';
import '../widgets/menu_product_card.dart';
import '../widgets/product_detail_sheet.dart';

class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  final Map<int, GlobalKey> _categoryKeys = {};
  int _selectedCategoryId = -1;

  @override
  void initState() {
    super.initState();
    context.read<MenuBloc>().add(LoadMenu());
  }

  void _scrollToCategory(int categoryId) {
    setState(() => _selectedCategoryId = categoryId);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final key = _categoryKeys[categoryId];
      final categoryContext = key?.currentContext;
      if (categoryContext == null) return;

      Scrollable.ensureVisible(
        categoryContext,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOut,
        alignment: 0,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final tableId = context.watch<SessionCubit>().state;
    final displayTable = TableMapper.getTableName(tableId);

    return Scaffold(
      appBar: AppBar(
        leading: const AppLogo(),
        title: Text(
          tableId != null ? displayTable : 'Menu Quán',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          BlocBuilder<MenuBloc, MenuState>(
            builder: (context, state) {
              if (state is! MenuLoaded) return const SizedBox.shrink();

              return IconButton(
                icon: const Icon(Icons.search),
                onPressed: () {
                  showSearch(
                    context: context,
                    delegate: FoodSearchDelegate(products: state.products),
                  );
                },
              );
            },
          ),
        ],
      ),
      body: BlocConsumer<MenuBloc, MenuState>(
        listener: (context, state) {
          if (state is MenuLoaded &&
              state.categories.isNotEmpty &&
              _selectedCategoryId == -1) {
            setState(() => _selectedCategoryId = state.categories.first.id);
          }
        },
        builder: (context, state) {
          if (state is MenuLoading || state is MenuInitial) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is MenuError) {
            return Center(child: Text('Lỗi: ${state.message}'));
          }

          if (state is! MenuLoaded) {
            return const SizedBox.shrink();
          }

          return _MenuContent(
            state: state,
            categoryKeys: _categoryKeys,
            selectedCategoryId: _selectedCategoryId,
            onCategorySelected: _scrollToCategory,
          );
        },
      ),
    );
  }
}

class _MenuContent extends StatelessWidget {
  final MenuLoaded state;
  final Map<int, GlobalKey> categoryKeys;
  final int selectedCategoryId;
  final ValueChanged<int> onCategorySelected;

  const _MenuContent({
    required this.state,
    required this.categoryKeys,
    required this.selectedCategoryId,
    required this.onCategorySelected,
  });

  @override
  Widget build(BuildContext context) {
    final productsByCategory = _productsByCategory(state.products);
    final categoryIds = state.categories.map((category) => category.id).toSet();
    categoryKeys.removeWhere(
      (categoryId, _) => !categoryIds.contains(categoryId),
    );

    return Column(
      children: [
        MenuCategoryTabs(
          categories: state.categories,
          selectedCategoryId: selectedCategoryId,
          onCategorySelected: onCategorySelected,
        ),
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              children: state.categories.map((category) {
                final categoryProducts =
                    productsByCategory[category.id] ?? const <Product>[];

                return _MenuCategorySection(
                  key: categoryKeys.putIfAbsent(category.id, () => GlobalKey()),
                  categoryName: category.name,
                  products: categoryProducts,
                );
              }).toList(),
            ),
          ),
        ),
      ],
    );
  }

  Map<int, List<Product>> _productsByCategory(List<Product> products) {
    final groupedProducts = <int, List<Product>>{};
    for (final product in products) {
      groupedProducts.putIfAbsent(product.categoryId, () => []).add(product);
    }
    return groupedProducts;
  }
}

class _MenuCategorySection extends StatelessWidget {
  final String categoryName;
  final List<Product> products;

  const _MenuCategorySection({
    super.key,
    required this.categoryName,
    required this.products,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
          child: Text(
            categoryName,
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),
        ),
        if (products.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'Chưa có món ăn nào trong danh mục này.',
              style: TextStyle(fontStyle: FontStyle.italic),
            ),
          )
        else
          ...products.map(
            (product) => MenuProductCard(
              product: product,
              onTap: () => showProductDetailSheet(context, product),
            ),
          ),
      ],
    );
  }
}
