class AppStrings {
  const AppStrings._();

  static const String appTitle = 'Phenikaa F&B';
  static const String menuTitle = 'Menu Quán';
  static const String cartTitle = 'Giỏ hàng';
  static const String historyTitle = 'Lịch sử';
  static const String qrScannerTitle = 'Quét mã QR tại bàn';
  static const String noTableSelected = 'Chưa chọn bàn';
  static const String loadingTable = 'Đang tải...';

  static const String menuTab = 'Menu';
  static const String cartTab = 'Giỏ hàng';
  static const String historyTab = 'Lịch sử';

  static const String noFoodFound = 'Không tìm thấy món ăn nào.';
  static const String searchFoodHint = 'Tìm món ăn...';
  static const String noItemsInCategory =
      'Chưa có món ăn nào trong danh mục này.';
  static const String bestseller = 'BESTSELLER';
  static const String outOfStock = 'HẾT HÀNG';
  static const String outOfStockShort = 'Hết hàng';
  static const String itemUnavailable = 'Món này hiện đã hết hàng';

  static const String quantity = 'Số lượng';
  static const String specialNote = 'Ghi chú đặc biệt';
  static const String noteHint = 'VD: Ít đường, không đá, nhiều hành...';
  static const String invalidNote = 'Ghi chú không được chứa ký tự đặc biệt';
  static const String addToCart = 'Thêm vào giỏ';
  static const String addAnotherItem = 'Thêm món khác';
  static const String addNewItem = 'Thêm món mới';

  static const String emptyCart = 'Giỏ hàng đang trống';
  static const String unavailableCartWarning =
      'Giỏ hàng có món đã hết hàng. Vui lòng giảm số lượng hoặc xóa món trước khi đặt.';
  static const String total = 'Tổng cộng';
  static const String submittingOrder = 'Đang gửi đơn...';
  static const String confirmOrder = 'Xác nhận đặt món';
  static const String scanTableBeforeOrdering =
      'Vui lòng quét mã QR bàn trước khi đặt món.';

  static const String emptyHistory = 'Chưa có lịch sử đặt món';
  static const String backToMenu = 'Quay lại Menu';
  static const String noServedItemsForCheckout =
      'Chưa có món nào được phục vụ để thanh toán!';
  static const String thanksForOrdering = 'Cảm ơn quý khách đã ủng hộ!';
  static const String seeYouAgain =
      '"Chúc quý khách một ngày ngon miệng và\nhẹn gặp lại!"';
  static const String orderStatus = 'Trạng thái đơn hàng';
  static const String orderedItems = 'Món đã đặt';
  static const String addMoreItems = 'Đặt thêm món';
  static const String requestCheckout = 'Yêu cầu thanh toán';
  static const String confirmPayment = 'Xác nhận thanh toán';

  static const String orderCancelled = 'Đơn hàng đã bị hủy';
  static const String contactStaffForSupport =
      'Vui lòng liên hệ nhân viên nếu cần hỗ trợ.';
  static const String orderStepNew = 'Mới';
  static const String orderStepPreparing = 'Đang\nchuẩn bị';
  static const String orderStepServed = 'Đã phục vụ';

  static const String leaveTable = 'Rời bàn';
  static const String leaveTableTitle = 'Xác nhận rời bàn';
  static const String cancel = 'Hủy';
  static const String thisTable = 'bàn này';

  static const String noQrFound = 'Không tìm thấy mã QR trong ảnh.';
  static const String closedTableTitle = 'Bàn đang đóng';
  static const String missingTableTitle = 'Bàn không tồn tại';
  static const String missingTableMessage =
      'Không tìm thấy bàn này trong hệ thống. Vui lòng kiểm tra lại mã QR hoặc liên hệ nhân viên.';
  static const String gotIt = 'Đã hiểu';
  static const String invalidQr =
      'Mã QR không hợp lệ. Vui lòng liên hệ nhân viên.';
  static const String scanning = 'Đang quét...';
  static const String chooseQrImage = 'Chọn ảnh QR';

  static const String orderTrackingCodeMissing =
      'Backend không trả về mã theo dõi đơn hàng.';
  static const String categoriesLoadFailed =
      'Không thể tải danh mục. Vui lòng thử lại.';
  static const String menuLoadFailed = 'Không thể tải menu. Vui lòng thử lại.';
  static const String unknownError = 'Unknown error occurred';

  static String errorMessage(String message) => 'Lỗi: $message';
  static String orderSuccess(String trackingCode) =>
      'Đặt món thành công. Mã theo dõi: $trackingCode';
  static String subtotalItems(int totalItems) => 'Tạm tính ($totalItems món)';
  static String orderForTable(String displayTable) => 'Đặt cho $displayTable';
  static String fallbackTableName(String uuid) => 'Bàn $uuid';
  static String addToCartWithTotal(String totalPrice) =>
      '$addToCart - $totalPrice';
  static String addedToCart(String productName, int quantity) =>
      'Đã thêm $productName (x$quantity) vào giỏ hàng';
  static String closedTableMessage(String tableName) =>
      '$tableName hiện đang đóng. Vui lòng chọn bàn khác hoặc liên hệ nhân viên.';
  static String leaveTableMessage(String displayTable) =>
      'Bạn có chắc chắn muốn rời khỏi $displayTable không?\nGiỏ hàng hiện tại của bạn sẽ bị xóa.';
  static String orderCode(String code) => 'Mã đơn: #$code';
  static String itemQuantity(int quantity) => 'x$quantity';
}
