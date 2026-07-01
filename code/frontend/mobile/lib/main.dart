import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import 'core/utils/table_mapper.dart';
import 'data/repositories/menu_repository.dart';
import 'data/repositories/order_repository.dart';
import 'presentation/blocs/session/session_cubit.dart';
import 'presentation/blocs/cart/cart_bloc.dart';
import 'presentation/blocs/order/order_bloc.dart';
import 'presentation/blocs/menu/menu_bloc.dart';
import 'presentation/screens/qr_scanner_screen.dart';
import 'presentation/screens/main_screen.dart';

final goRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (context, state) => const QrScannerScreen()),
    GoRoute(path: '/main', builder: (context, state) => const MainScreen()),
  ],
);

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");

  final menuRepository = MenuRepository();

  runApp(
    MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => SessionCubit()),
        BlocProvider(create: (_) => CartBloc()),
        BlocProvider(create: (_) => OrderBloc(repository: OrderRepository())),
        BlocProvider(create: (_) => MenuBloc(repository: menuRepository)),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Phenikaa F&B',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.orange),
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.orange,
          foregroundColor: Colors.white,
          centerTitle: true,
        ),
      ),
      routerConfig: goRouter,
    );
  }
}
