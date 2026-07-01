import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:fe_flutter/data/repositories/menu_repository.dart';
import 'package:fe_flutter/presentation/blocs/menu/menu_bloc.dart';
import 'package:fe_flutter/presentation/blocs/menu/menu_event.dart';
import 'package:fe_flutter/presentation/blocs/menu/menu_state.dart';
import 'package:fe_flutter/data/models/category.dart';

class MockMenuRepository extends Mock implements MenuRepository {}

void main() {
  group('MenuBloc', () {
    late MenuRepository mockRepository;
    late MenuBloc menuBloc;

    setUp(() {
      mockRepository = MockMenuRepository();
      menuBloc = MenuBloc(repository: mockRepository);
    });

    tearDown(() {
      menuBloc.close();
    });

    test('initial state is MenuInitial', () {
      expect(menuBloc.state, MenuInitial());
    });

    blocTest<MenuBloc, MenuState>(
      'emits [MenuLoading, MenuLoaded] when LoadMenu is added successfully',
      build: () {
        when(() => mockRepository.getCategories()).thenAnswer((_) async => <Category>[]);
        return menuBloc;
      },
      act: (bloc) => bloc.add(LoadMenu()),
      expect: () => [
        MenuLoading(),
        isA<MenuLoaded>(),
      ],
    );
  });
}
