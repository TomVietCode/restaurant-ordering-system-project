import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:fe_flutter/presentation/widgets/food_image.dart';

void main() {
  testWidgets('FoodImage renders the placeholder when no URL is provided', (
    tester,
  ) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(body: FoodImage(imageUrl: null, width: 80, height: 80)),
      ),
    );

    final image = tester.widget<Image>(find.byType(Image));

    expect(image.image, isA<AssetImage>());
    expect((image.image as AssetImage).assetName, foodPlaceholderAsset);
    expect(image.width, 80);
    expect(image.height, 80);
  });
}
