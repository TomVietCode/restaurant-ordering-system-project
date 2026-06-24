import 'enums.dart';

class UserModel {
  final int userId;
  final String username;
  final String passwordHash; // Thường không trả về frontend, nhưng vẫn ánh xạ theo DB
  final UserRole role;
  final String? fullName;
  final String? phone;
  final bool isActive;

  UserModel({
    required this.userId,
    required this.username,
    required this.passwordHash,
    required this.role,
    this.fullName,
    this.phone,
    this.isActive = true,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      userId: json['user_id'],
      username: json['username'],
      passwordHash: json['password_hash'] ?? '',
      role: UserRole.fromString(json['role'] ?? ''),
      fullName: json['full_name'],
      phone: json['phone'],
      isActive: json['is_active'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'username': username,
      'password_hash': passwordHash,
      'role': role.value,
      'full_name': fullName,
      'phone': phone,
      'is_active': isActive,
    };
  }
}
