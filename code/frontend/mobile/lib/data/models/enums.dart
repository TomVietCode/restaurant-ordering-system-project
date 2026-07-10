enum OrderStatus {
  newOrder('NEW'),
  preparing('PREPARING'),
  served('SERVED'),
  paid('PAID'),
  cancel('CANCEL');

  final String value;
  const OrderStatus(this.value);

  factory OrderStatus.fromString(String val) {
    final normalized = val.trim().toUpperCase();
    return OrderStatus.values.firstWhere(
      (e) => e.value == normalized,
      orElse: () => OrderStatus.newOrder,
    );
  }
}

enum PaymentMethod {
  cash('CASH'),
  transfer('TRANSFER');

  final String value;
  const PaymentMethod(this.value);

  factory PaymentMethod.fromString(String val) {
    return PaymentMethod.values.firstWhere(
      (e) => e.value == val,
      orElse: () => PaymentMethod.cash,
    );
  }
}

enum UserRole {
  owner('OWNER'),
  staff('STAFF');

  final String value;
  const UserRole(this.value);

  factory UserRole.fromString(String val) {
    return UserRole.values.firstWhere(
      (e) => e.value == val,
      orElse: () => UserRole.staff,
    );
  }
}
