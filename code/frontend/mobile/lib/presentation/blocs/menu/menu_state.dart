import 'package:equatable/equatable.dart';
import '../../../data/models/product.dart';
import '../../../data/models/category.dart';

abstract class MenuState extends Equatable {
  const MenuState();
  @override
  List<Object?> get props => [];
}

class MenuInitial extends MenuState {}

class MenuLoading extends MenuState {}

class MenuLoaded extends MenuState {
  final List<Category> categories;
  final List<Product> products;

  const MenuLoaded({required this.categories, required this.products});

  @override
  List<Object?> get props => [categories, products];
}

class MenuError extends MenuState {
  final String message;
  const MenuError(this.message);
  @override
  List<Object?> get props => [message];
}
