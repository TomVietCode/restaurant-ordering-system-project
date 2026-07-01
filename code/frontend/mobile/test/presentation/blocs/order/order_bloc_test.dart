import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:fe_flutter/data/repositories/order_repository.dart';
import 'package:fe_flutter/presentation/blocs/order/order_bloc.dart';
import 'package:fe_flutter/presentation/blocs/order/order_event.dart';
import 'package:fe_flutter/presentation/blocs/order/order_state.dart';

class MockOrderRepository extends Mock implements OrderRepository {}

void main() {
  group('OrderBloc', () {
    late OrderRepository mockRepository;
    late OrderBloc orderBloc;

    setUp(() {
      mockRepository = MockOrderRepository();
      when(() => mockRepository.orderUpdatesStream).thenAnswer((_) => const Stream.empty());
      orderBloc = OrderBloc(repository: mockRepository);
    });

    tearDown(() {
      orderBloc.close();
    });

    test('initial state is OrderState with empty items', () {
      expect(orderBloc.state.items.isEmpty, true);
    });

    blocTest<OrderBloc, OrderState>(
      'emits clear state when ClearOrder is added',
      build: () => orderBloc,
      act: (bloc) => bloc.add(ClearOrder()),
      expect: () => [
        const OrderState(),
      ],
    );
  });
}
