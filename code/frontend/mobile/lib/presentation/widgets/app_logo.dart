import 'package:flutter/material.dart';

class AppLogo extends StatelessWidget {
  final double padding;

  const AppLogo({super.key, this.padding = 8});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(padding),
      child: Container(
        decoration: const BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.white,
        ),
        clipBehavior: Clip.antiAlias,
        child: Image.asset(
          'assets/images/logo.png',
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) =>
              const Icon(Icons.restaurant, color: Colors.orange),
        ),
      ),
    );
  }
}
