import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/models/category.dart';
import '../../../data/models/product.dart';
import '../../../data/repositories/menu_repository.dart';
import 'menu_event.dart';
import 'menu_state.dart';

class MenuBloc extends Bloc<MenuEvent, MenuState> {
  final MenuRepository repository;

  MenuBloc({required this.repository}) : super(MenuInitial()) {
    on<LoadMenu>(_onLoadMenu);
  }

  Future<void> _onLoadMenu(LoadMenu event, Emitter<MenuState> emit) async {
    emit(MenuLoading());
    try {
      final results = await Future.wait<dynamic>([
        repository.getCategories(),
        repository.getProducts(),
      ]);

      emit(
        MenuLoaded(
          categories: results[0] as List<Category>,
          products: results[1] as List<Product>,
        ),
      );
    } catch (e) {
      emit(MenuError(e.toString()));
    }
  }
}
