import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:fe_flutter/data/repositories/menu_repository.dart';
import 'package:fe_flutter/presentation/blocs/menu/menu_bloc.dart';
import 'package:fe_flutter/presentation/blocs/menu/menu_event.dart';
import 'package:fe_flutter/presentation/blocs/menu/menu_state.dart';
import 'package:fe_flutter/data/models/category.dart';
import 'package:fe_flutter/data/models/product.dart';

class MockMenuRepository extends Mock implements MenuRepository {}

void main() {
  group('MenuBloc', () {
    late MockMenuRepository mockRepository;

    setUp(() {
      mockRepository = MockMenuRepository();
      when(
        () => mockRepository.menuUpdatesStream,
      ).thenAnswer((_) => const Stream<Map<String, dynamic>>.empty());
    });

    test('initial state is MenuInitial', () {
      final menuBloc = MenuBloc(repository: mockRepository);
      expect(menuBloc.state, MenuInitial());
      menuBloc.close();
    });

    blocTest<MenuBloc, MenuState>(
      'emits [MenuLoading, MenuLoaded] when LoadMenu is added successfully',
      build: () {
        const categories = [
          Category(id: 1, name: 'Coffee', description: 'Hot drinks'),
        ];
        const products = [
          Product(
            id: 101,
            name: 'Black Coffee',
            categoryId: 1,
            price: 29000,
            isRemain: true,
          ),
        ];

        when(
          () => mockRepository.getCategories(),
        ).thenAnswer((_) async => categories);
        when(
          () => mockRepository.getProducts(),
        ).thenAnswer((_) async => products);

        return MenuBloc(repository: mockRepository);
      },
      act: (bloc) => bloc.add(LoadMenu()),
      expect: () => [
        MenuLoading(),
        const MenuLoaded(
          categories: [
            Category(id: 1, name: 'Coffee', description: 'Hot drinks'),
          ],
          products: [
            Product(
              id: 101,
              name: 'Black Coffee',
              categoryId: 1,
              price: 29000,
              isRemain: true,
            ),
          ],
          bestsellerIds: {101},
        ),
      ],
    );
  });
}
