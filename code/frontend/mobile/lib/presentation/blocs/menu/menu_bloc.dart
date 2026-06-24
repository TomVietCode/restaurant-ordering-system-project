import 'package:flutter_bloc/flutter_bloc.dart';
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
      final categories = await repository.getCategories();
      final products = await repository.getProducts();
      emit(MenuLoaded(categories: categories, products: products));
    } catch (e) {
      emit(MenuError(e.toString()));
    }
  }
}
