class TableMapper {
  static const Map<String, String> _tableMap = {
    'da27133a-b8f9-45d1-9f21-4cba52e3d884': 'Bàn 01',
    'fe277fdd-e705-43bb-90f3-514113aa60e6': 'Bàn 02',
    '48067133-ce1c-42b3-a135-88781a4bff94': 'Bàn 03',
    '79c12875-3c17-41ba-8ce2-711a1c719fd9': 'Bàn 04',
    'dd167a07-e08b-433b-b111-c3c4b44d9782': 'Bàn 05',
    'd43bca3b-042c-4913-9fb5-f1661d5cc993': 'Bàn 06',
    '66c23e41-d348-4428-984a-634d06723faa': 'Bàn VIP 01',
    '40593f51-7960-49b3-849a-7444ccab9852': 'Bàn VIP 02',
  };

  static String getTableName(String? uuid) {
    if (uuid == null) return 'Chưa chọn bàn';
    return _tableMap[uuid] ?? 'Bàn ${uuid.substring(0, 8).toUpperCase()}';
  }
}
