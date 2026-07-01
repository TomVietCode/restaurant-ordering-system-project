extension PriceFormatting on num {
  String toVND() {
    final str = toInt().toString();
    return '${str.replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')} đ';
  }
}
