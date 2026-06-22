class UserTokenModel {
  final String tokenId;
  final int userId;
  final String refreshToken;
  final DateTime expiredAt;
  final DateTime? revokedAt;

  UserTokenModel({
    required this.tokenId,
    required this.userId,
    required this.refreshToken,
    required this.expiredAt,
    this.revokedAt,
  });

  factory UserTokenModel.fromJson(Map<String, dynamic> json) {
    return UserTokenModel(
      // Lưu ý: Trong ERD ghi là 'tokent_id' (có chữ t), ta bắt cả 2 trường hợp cho chắc
      tokenId: json['token_id'] ?? json['tokent_id'] ?? '',
      userId: json['user_id'],
      refreshToken: json['refresh_token'],
      expiredAt: DateTime.parse(json['expired_at']),
      revokedAt: json['revoked_at'] != null ? DateTime.parse(json['revoked_at']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'token_id': tokenId,
      'user_id': userId,
      'refresh_token': refreshToken,
      'expired_at': expiredAt.toIso8601String(),
      'revoked_at': revokedAt?.toIso8601String(),
    };
  }
}
