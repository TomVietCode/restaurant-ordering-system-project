import 'package:flutter_bloc/flutter_bloc.dart';

class SessionCubit extends Cubit<String?> {
  SessionCubit() : super(null);

  void setTableId(String tableId) => emit(tableId);
  void clearSession() => emit(null);
}
