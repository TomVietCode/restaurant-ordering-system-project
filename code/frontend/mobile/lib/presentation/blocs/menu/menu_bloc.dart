import 'dart:async';
import 'dart:math';

import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../data/repositories/menu_repository.dart';
import 'menu_event.dart';
import 'menu_state.dart';

class MenuBloc extends Bloc<MenuEvent, MenuState> {
  final MenuRepository repository;
  StreamSubscription<Map<String, dynamic>>? _menuUpdatesSubscription;

  MenuBloc({required this.repository}) : super(MenuInitial()) {
    on<LoadMenu>(_onLoadMenu);
    on<UpdateProductAvailability>(_onUpdateProductAvailability);

    _menuUpdatesSubscription = repository.menuUpdatesStream.listen(
      _handleMenuUpdate,
    );
  }

  Future<void> _onLoadMenu(LoadMenu event, Emitter<MenuState> emit) async {
    emit(MenuLoading());
    try {
      final categoriesFuture = repository.getCategories();
      final productsFuture = repository.getProducts();
      final categories = await categoriesFuture;
      final products = await productsFuture;

      final bestsellerIds = <int>{};
      final random = Random();

      for (final category in categories) {
        final categoryProducts = products
            .where((p) => p.categoryId == category.id)
            .toList();
        categoryProducts.shuffle(random);
        bestsellerIds.addAll(categoryProducts.take(2).map((p) => p.id));
      }

      emit(
        MenuLoaded(
          categories: categories,
          products: products,
          bestsellerIds: bestsellerIds,
        ),
      );
    } catch (e) {
      emit(MenuError(e.toString()));
    }
  }

  void _handleMenuUpdate(Map<String, dynamic> data) {
    if (data['event'] != 'menu:item-availability-changed') return;

    final payload = data['payload'];
    if (payload is! Map) return;

    final itemId = _intValue(payload, ['itemId', 'item_id', 'id']);
    final isRemain = _boolValue(payload, ['isRemain', 'is_remain']);

    if (itemId == null || isRemain == null || isClosed) return;

    add(UpdateProductAvailability(itemId: itemId, isRemain: isRemain));
  }

  void _onUpdateProductAvailability(
    UpdateProductAvailability event,
    Emitter<MenuState> emit,
  ) {
    final currentState = state;
    if (currentState is! MenuLoaded) return;

    bool changed = false;
    final products = currentState.products.map((product) {
      if (product.id != event.itemId) return product;
      if (product.isRemain == event.isRemain) return product;

      changed = true;
      return product.copyWith(isRemain: event.isRemain);
    }).toList();

    if (!changed) return;

    emit(
      MenuLoaded(
        categories: currentState.categories,
        products: products,
        bestsellerIds: currentState.bestsellerIds,
      ),
    );
  }

  int? _intValue(Map<dynamic, dynamic> map, List<String> keys) {
    for (final key in keys) {
      final value = map[key];
      if (value == null) continue;

      final parsed = int.tryParse(value.toString());
      if (parsed != null) return parsed;
    }

    return null;
  }

  bool? _boolValue(Map<dynamic, dynamic> map, List<String> keys) {
    for (final key in keys) {
      final value = map[key];
      if (value is bool) return value;
      if (value == null) continue;

      final normalized = value.toString().trim().toLowerCase();
      if (normalized == 'true') return true;
      if (normalized == 'false') return false;
    }

    return null;
  }

  @override
  Future<void> close() {
    _menuUpdatesSubscription?.cancel();
    return super.close();
  }
}
