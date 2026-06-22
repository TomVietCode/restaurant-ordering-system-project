class TableModel {
  final int tableId;
  final int? tableNumber;
  final String? qrCode;
  final bool isAvailable;

  TableModel({
    required this.tableId,
    this.tableNumber,
    this.qrCode,
    this.isAvailable = true,
  });

  factory TableModel.fromJson(Map<String, dynamic> json) {
    return TableModel(
      tableId: json['table_id'],
      tableNumber: json['table_number'],
      qrCode: json['qr_code'],
      isAvailable: json['is_available'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'table_id': tableId,
      'table_number': tableNumber,
      'qr_code': qrCode,
      'is_available': isAvailable,
    };
  }
}
