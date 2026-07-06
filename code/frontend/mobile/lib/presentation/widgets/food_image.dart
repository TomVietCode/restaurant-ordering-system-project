import 'package:flutter/material.dart';

const foodPlaceholderAsset = 'assets/images/food_placeholder.png';

class FoodImage extends StatelessWidget {
  final String? imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;

  const FoodImage({
    super.key,
    required this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
  });

  @override
  Widget build(BuildContext context) {
    final url = imageUrl?.trim();
    if (url != null && url.isNotEmpty) {
      return LayoutBuilder(
        builder: (context, constraints) {
          final devicePixelRatio = MediaQuery.devicePixelRatioOf(context);
          final targetWidth = _targetPixels(
            width ?? constraints.maxWidth,
            devicePixelRatio,
          );
          final targetHeight = _targetPixels(
            height ?? constraints.maxHeight,
            devicePixelRatio,
          );

          return Image.network(
            _optimizedImageUrl(url, targetWidth),
            width: width,
            height: height,
            fit: fit,
            cacheWidth: targetWidth,
            cacheHeight: targetHeight,
            filterQuality: FilterQuality.low,
            gaplessPlayback: true,
            frameBuilder: (context, child, frame, wasSynchronouslyLoaded) {
              if (wasSynchronouslyLoaded || frame != null) {
                return child;
              }
              return _placeholder();
            },
            errorBuilder: (_, _, _) => _placeholder(),
          );
        },
      );
    }

    return _placeholder();
  }

  int? _targetPixels(double logicalSize, double devicePixelRatio) {
    if (!logicalSize.isFinite || logicalSize <= 0) {
      return null;
    }

    return (logicalSize * devicePixelRatio).round().clamp(80, 480);
  }

  String _optimizedImageUrl(String url, int? targetWidth) {
    final uri = Uri.tryParse(url);
    if (uri == null || uri.host != 'images.unsplash.com') {
      return url;
    }

    final params = Map<String, String>.from(uri.queryParameters)
      ..['auto'] = 'format'
      ..['fit'] = 'crop'
      ..['q'] = '60'
      ..['w'] = '${targetWidth ?? 360}';

    return uri.replace(queryParameters: params).toString();
  }

  Widget _placeholder() {
    return Image.asset(
      foodPlaceholderAsset,
      width: width,
      height: height,
      fit: fit,
    );
  }
}
