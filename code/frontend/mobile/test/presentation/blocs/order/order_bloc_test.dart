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
    late MockOrderRepository mockRepository;

    setUp(() {
      mockRepository = MockOrderRepository();
    });

    OrderBloc buildBloc() {
      when(
        () => mockRepository.orderUpdatesStream,
      ).thenAnswer((_) => const Stream.empty());
      return OrderBloc(repository: mockRepository);
    }

    test('initial state is OrderState with empty items', () {
      final orderBloc = buildBloc();
      expect(orderBloc.state.items.isEmpty, true);
      orderBloc.close();
    });

    blocTest<OrderBloc, OrderState>(
      'clears the tracked order state when ClearOrder is added',
      build: buildBloc,
      seed: () => const OrderState(orderId: '42', trackingCode: 'TRK-42'),
      act: (bloc) => bloc.add(ClearOrder()),
      expect: () => [const OrderState()],
    );
  });
}
