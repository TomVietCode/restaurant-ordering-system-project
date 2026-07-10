import 'package:equatable/equatable.dart';

abstract class MenuEvent extends Equatable {
  const MenuEvent();
  @override
  List<Object?> get props => [];
}

class LoadMenu extends MenuEvent {}

class UpdateProductAvailability extends MenuEvent {
  final int itemId;
  final bool isRemain;

  const UpdateProductAvailability({
    required this.itemId,
    required this.isRemain,
  });

  @override
  List<Object?> get props => [itemId, isRemain];
}
