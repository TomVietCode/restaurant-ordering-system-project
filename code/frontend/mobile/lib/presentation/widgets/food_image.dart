import 'package:flutter/foundation.dart' show debugPrint, listEquals;
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

const foodPlaceholderAsset = 'assets/images/food_placeholder.png';

class FoodImage extends StatefulWidget {
  final String? imageUrl;
  final List<String>? imageUrls;
  final double? width;
  final double? height;
  final BoxFit fit;

  const FoodImage({
    super.key,
    this.imageUrl,
    this.imageUrls,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
  });

  @override
  State<FoodImage> createState() => _FoodImageState();
}

class _FoodImageState extends State<FoodImage> {
  int _urlIndex = 0;

  @override
  void didUpdateWidget(covariant FoodImage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!listEquals(_rawUrls(oldWidget), _rawUrls(widget))) {
      _urlIndex = 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    final urls = _normalizedUrls(widget);
    if (urls.isNotEmpty) {
      final index = _urlIndex < urls.length ? _urlIndex : urls.length - 1;
      final url = urls[index];

      return LayoutBuilder(
        builder: (context, constraints) {
          final devicePixelRatio = MediaQuery.devicePixelRatioOf(context);
          final targetWidth = _targetPixels(
            widget.width ?? constraints.maxWidth,
            devicePixelRatio,
          );
          final targetHeight = _targetPixels(
            widget.height ?? constraints.maxHeight,
            devicePixelRatio,
          );

          return Image.network(
            _optimizedImageUrl(url, targetWidth),
            key: ValueKey(url),
            width: widget.width,
            height: widget.height,
            fit: widget.fit,
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
            errorBuilder: (_, error, _) {
              _tryNextUrl(urls, url, error);
              return _placeholder();
            },
          );
        },
      );
    }

    return _placeholder();
  }

  List<String> _rawUrls(FoodImage widget) {
    return [
      ...?widget.imageUrls,
      if (widget.imageUrl != null) widget.imageUrl!,
    ];
  }

  List<String> _normalizedUrls(FoodImage widget) {
    final seen = <String>{};

    return _rawUrls(widget)
        .map(_normalizeImageUrl)
        .where((url) => url.isNotEmpty)
        .where(seen.add)
        .toList();
  }

  String _normalizeImageUrl(String rawUrl) {
    final value = rawUrl.trim();
    if (value.isEmpty) return '';
    if (value.startsWith('//')) return 'https:$value';

    final uri = Uri.tryParse(value);
    if (uri == null) return value;

    if (uri.hasScheme && uri.host.isNotEmpty) {
      return _rewriteLocalhostUrl(uri).toString();
    }

    final apiOrigin = _apiOrigin();
    return apiOrigin?.resolve(value).toString() ?? value;
  }

  Uri _rewriteLocalhostUrl(Uri uri) {
    if (!_isLoopbackHost(uri.host)) return uri;

    final apiOrigin = _apiOrigin();
    if (apiOrigin == null || !_isPrivateDevHost(apiOrigin.host)) return uri;

    return uri.replace(host: apiOrigin.host);
  }

  Uri? _apiOrigin() {
    final baseUrl = dotenv.env['API_BASE_URL']?.trim();
    if (baseUrl == null || baseUrl.isEmpty) return null;

    final uri = Uri.tryParse(baseUrl);
    if (uri == null || !uri.hasScheme || uri.host.isEmpty) return null;

    return Uri(
      scheme: uri.scheme,
      host: uri.host,
      port: uri.hasPort ? uri.port : null,
    );
  }

  bool _isLoopbackHost(String host) {
    return host == 'localhost' || host == '127.0.0.1' || host == '::1';
  }

  bool _isPrivateDevHost(String host) {
    if (host == '10.0.2.2' || host == 'host.docker.internal') return true;
    if (host.startsWith('10.') || host.startsWith('192.168.')) return true;

    final parts = host.split('.');
    if (parts.length == 4 && parts.first == '172') {
      final second = int.tryParse(parts[1]);
      return second != null && second >= 16 && second <= 31;
    }

    return false;
  }

  void _tryNextUrl(List<String> urls, String failedUrl, Object error) {
    debugPrint('FoodImage failed to load: $failedUrl ($error)');
    if (_urlIndex >= urls.length - 1) return;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;

      setState(() {
        if (_urlIndex < urls.length - 1 && urls[_urlIndex] == failedUrl) {
          _urlIndex += 1;
        }
      });
    });
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
      width: widget.width,
      height: widget.height,
      fit: widget.fit,
    );
  }
}
