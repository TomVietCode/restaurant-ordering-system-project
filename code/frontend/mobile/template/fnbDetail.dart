Container(
    width: 390,
    padding: const EdgeInsets.only(bottom: 128),
    decoration: BoxDecoration(color: Colors.white),
    child: Stack(
        children: [
            Container(
                width: double.infinity,
                padding: const EdgeInsets.only(top: 64, bottom: 5),
                child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                        Container(
                            width: double.infinity,
                            clipBehavior: Clip.antiAlias,
                            decoration: BoxDecoration(color: const Color(0xFFFEF1E9)),
                            child: Stack(
                                children: [
                                    Container(
                                        width: double.infinity,
                                        height: 390,
                                        clipBehavior: Clip.antiAlias,
                                        decoration: BoxDecoration(
                                            image: DecorationImage(
                                                image: NetworkImage("https://placehold.co/390x390"),
                                                fit: BoxFit.fill,
                                            ),
                                        ),
                                    ),
                                    Positioned(
                                        left: 0,
                                        top: 294,
                                        child: Container(
                                            width: 390,
                                            height: 96,
                                            decoration: BoxDecoration(
                                                gradient: LinearGradient(
                                                    begin: Alignment(0.50, 1.00),
                                                    end: Alignment(0.50, 0.00),
                                                    colors: [Colors.white, Colors.white.withValues(alpha: 0)],
                                                ),
                                            ),
                                        ),
                                    ),
                                ],
                            ),
                        ),
                        ConstrainedBox(
                            constraints: BoxConstraints(maxWidth: 896),
                            child: Container(
                                width: double.infinity,
                                height: 480,
                                child: Stack(
                                    children: [
                                        Positioned(
                                            left: 40,
                                            top: 20,
                                            child: Container(
                                                width: 310,
                                                child: Row(
                                                    mainAxisSize: MainAxisSize.min,
                                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    spacing: 24.04,
                                                    children: [
                                                        Column(
                                                            mainAxisSize: MainAxisSize.min,
                                                            mainAxisAlignment: MainAxisAlignment.start,
                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                            spacing: 4,
                                                            children: [
                                                                Container(
                                                                    width: double.infinity,
                                                                    child: Column(
                                                                        mainAxisSize: MainAxisSize.min,
                                                                        mainAxisAlignment: MainAxisAlignment.start,
                                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                                        children: [
                                                                            Text(
                                                                                'Phở Bò Đặc Biệt',
                                                                                style: TextStyle(
                                                                                    color: const Color(0xFF201B16),
                                                                                    fontSize: 24,
                                                                                    fontFamily: 'Epilogue',
                                                                                    fontWeight: FontWeight.w700,
                                                                                    height: 1.33,
                                                                                ),
                                                                            ),
                                                                        ],
                                                                    ),
                                                                ),
                                                                Container(
                                                                    width: double.infinity,
                                                                    child: Row(
                                                                        mainAxisSize: MainAxisSize.min,
                                                                        mainAxisAlignment: MainAxisAlignment.start,
                                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                                        spacing: 8,
                                                                        children: [
                                                                            Container(
                                                                                height: double.infinity,
                                                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                                                decoration: ShapeDecoration(
                                                                                    color: const Color(0xFFF2E6DE),
                                                                                    shape: RoundedRectangleBorder(
                                                                                        borderRadius: BorderRadius.circular(9999),
                                                                                    ),
                                                                                ),
                                                                                child: Row(
                                                                                    mainAxisSize: MainAxisSize.min,
                                                                                    mainAxisAlignment: MainAxisAlignment.start,
                                                                                    crossAxisAlignment: CrossAxisAlignment.center,
                                                                                    spacing: 4,
                                                                                    children: [
                                                                                        Column(
                                                                                            mainAxisSize: MainAxisSize.min,
                                                                                            mainAxisAlignment: MainAxisAlignment.start,
                                                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                                                            children: [
                                                                                            ,
                                                                                            ],
                                                                                        ),
                                                                                        Text(
                                                                                            'Phổ biến',
                                                                                            style: TextStyle(
                                                                                                color: const Color(0xFF55423E),
                                                                                                fontSize: 12,
                                                                                                fontFamily: 'Epilogue',
                                                                                                fontWeight: FontWeight.w400,
                                                                                                height: 1.33,
                                                                                            ),
                                                                                        ),
                                                                                    ],
                                                                                ),
                                                                            ),
                                                                            Container(
                                                                                height: double.infinity,
                                                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                                                decoration: ShapeDecoration(
                                                                                    color: const Color(0xFFE07A5F),
                                                                                    shape: RoundedRectangleBorder(
                                                                                        borderRadius: BorderRadius.circular(9999),
                                                                                    ),
                                                                                ),
                                                                                child: Row(
                                                                                    mainAxisSize: MainAxisSize.min,
                                                                                    mainAxisAlignment: MainAxisAlignment.start,
                                                                                    crossAxisAlignment: CrossAxisAlignment.center,
                                                                                    children: [
                                                                                        Text(
                                                                                            'Must try',
                                                                                            style: TextStyle(
                                                                                                color: const Color(0xFF5B1604),
                                                                                                fontSize: 12,
                                                                                                fontFamily: 'Epilogue',
                                                                                                fontWeight: FontWeight.w400,
                                                                                                height: 1.33,
                                                                                            ),
                                                                                        ),
                                                                                    ],
                                                                                ),
                                                                            ),
                                                                        ],
                                                                    ),
                                                                ),
                                                            ],
                                                        ),
                                                        Column(
                                                            mainAxisSize: MainAxisSize.min,
                                                            mainAxisAlignment: MainAxisAlignment.start,
                                                            crossAxisAlignment: CrossAxisAlignment.end,
                                                            children: [
                                                                Text(
                                                                    '65.000đ',
                                                                    textAlign: TextAlign.right,
                                                                    style: TextStyle(
                                                                        color: const Color(0xFF9A442D),
                                                                        fontSize: 24,
                                                                        fontFamily: 'Epilogue',
                                                                        fontWeight: FontWeight.w700,
                                                                        height: 1.33,
                                                                    ),
                                                                ),
                                                            ],
                                                        ),
                                                    ],
                                                ),
                                            ),
                                        ),
                                        Positioned(
                                            left: 40,
                                            top: 92,
                                            child: Container(
                                                width: 310,
                                                padding: const EdgeInsets.only(bottom: 8),
                                                child: Column(
                                                    mainAxisSize: MainAxisSize.min,
                                                    mainAxisAlignment: MainAxisAlignment.start,
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                        Text(
                                                            'Phở bò truyền thống với nước dùng hầm\nxương bò 24h, thịt nạm giòn, tái mềm, gầu\nbéo ngậy. Kèm theo rau thơm, quẩy và\ncác gia vị đặc trưng.',
                                                            style: TextStyle(
                                                                color: const Color(0xFF55423E),
                                                                fontSize: 15,
                                                                fontFamily: 'Epilogue',
                                                                fontWeight: FontWeight.w400,
                                                                height: 1.47,
                                                            ),
                                                        ),
                                                    ],
                                                ),
                                            ),
                                        ),
                                        Positioned(
                                            left: 40,
                                            top: 200,
                                            child: Container(
                                                width: 310,
                                                height: 1,
                                                decoration: BoxDecoration(color: const Color(0xFFECE0D8)),
                                            ),
                                        ),
                                        Positioned(
                                            left: 40,
                                            top: 213,
                                            child: Container(
                                                width: 310,
                                                padding: const EdgeInsets.symmetric(vertical: 8),
                                                child: Column(
                                                    mainAxisSize: MainAxisSize.min,
                                                    mainAxisAlignment: MainAxisAlignment.start,
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    spacing: 12,
                                                    children: [
                                                        Container(
                                                            width: double.infinity,
                                                            child: Row(
                                                                mainAxisSize: MainAxisSize.min,
                                                                mainAxisAlignment: MainAxisAlignment.start,
                                                                crossAxisAlignment: CrossAxisAlignment.center,
                                                                spacing: 8,
                                                                children: [
                                                                    Column(
                                                                        mainAxisSize: MainAxisSize.min,
                                                                        mainAxisAlignment: MainAxisAlignment.start,
                                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                                        children: [
                                                                        ,
                                                                        ],
                                                                    ),
                                                                    Text(
                                                                        'Ghi chú cho đầu bếp',
                                                                        style: TextStyle(
                                                                            color: const Color(0xFF201B16),
                                                                            fontSize: 18,
                                                                            fontFamily: 'Epilogue',
                                                                            fontWeight: FontWeight.w700,
                                                                            height: 1.33,
                                                                        ),
                                                                    ),
                                                                ],
                                                            ),
                                                        ),
                                                        Container(
                                                            width: double.infinity,
                                                            padding: const EdgeInsets.only(
                                                                top: 12,
                                                                left: 12,
                                                                right: 12,
                                                                bottom: 34,
                                                            ),
                                                            clipBehavior: Clip.antiAlias,
                                                            decoration: ShapeDecoration(
                                                                color: Colors.white,
                                                                shape: RoundedRectangleBorder(
                                                                    side: BorderSide(
                                                                        width: 1,
                                                                        color: const Color(0xFFDBC1BA),
                                                                    ),
                                                                    borderRadius: BorderRadius.circular(8),
                                                                ),
                                                            ),
                                                            child: Row(
                                                                mainAxisSize: MainAxisSize.min,
                                                                mainAxisAlignment: MainAxisAlignment.center,
                                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                                children: [
                                                                    Expanded(
                                                                        child: Column(
                                                                            mainAxisSize: MainAxisSize.min,
                                                                            mainAxisAlignment: MainAxisAlignment.start,
                                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                                            children: [
                                                                                SizedBox(
                                                                                    width: 284,
                                                                                    child: Text(
                                                                                        'VD: Không hành, ít bánh phở, nước \nbéo...',
                                                                                        style: TextStyle(
                                                                                            color: const Color(0x7F55423E),
                                                                                            fontSize: 15,
                                                                                            fontFamily: 'Epilogue',
                                                                                            fontWeight: FontWeight.w400,
                                                                                            height: 1.47,
                                                                                        ),
                                                                                    ),
                                                                                ),
                                                                            ],
                                                                        ),
                                                                    ),
                                                                ],
                                                            ),
                                                        ),
                                                    ],
                                                ),
                                            ),
                                        ),
                                        Positioned(
                                            left: 40,
                                            top: 369,
                                            child: Container(
                                                width: 310,
                                                height: 1,
                                                decoration: BoxDecoration(color: const Color(0xFFECE0D8)),
                                            ),
                                        ),
                                        Positioned(
                                            left: 125,
                                            top: 390,
                                            child: Container(
                                                width: 140,
                                                padding: const EdgeInsets.all(4),
                                                decoration: ShapeDecoration(
                                                    color: const Color(0xFFF8ECE3),
                                                    shape: RoundedRectangleBorder(
                                                        side: BorderSide(
                                                            width: 1,
                                                            color: const Color(0xFFDBC1BA),
                                                        ),
                                                        borderRadius: BorderRadius.circular(9999),
                                                    ),
                                                    shadows: [
                                                        BoxShadow(
                                                            color: Color(0x0C000000),
                                                            blurRadius: 2,
                                                            offset: Offset(0, 1),
                                                            spreadRadius: 0,
                                                        )
                                                    ],
                                                ),
                                                child: Row(
                                                    mainAxisSize: MainAxisSize.min,
                                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                    crossAxisAlignment: CrossAxisAlignment.center,
                                                    spacing: 5,
                                                    children: [
                                                        Container(
                                                            width: 40,
                                                            height: 40,
                                                            decoration: ShapeDecoration(
                                                                color: Colors.white,
                                                                shape: RoundedRectangleBorder(
                                                                    borderRadius: BorderRadius.circular(9999),
                                                                ),
                                                            ),
                                                            child: Row(
                                                                mainAxisSize: MainAxisSize.min,
                                                                mainAxisAlignment: MainAxisAlignment.center,
                                                                crossAxisAlignment: CrossAxisAlignment.center,
                                                                children: [
                                                                    Column(
                                                                        mainAxisSize: MainAxisSize.min,
                                                                        mainAxisAlignment: MainAxisAlignment.start,
                                                                        crossAxisAlignment: CrossAxisAlignment.center,
                                                                        children: [
                                                                        ,
                                                                        ],
                                                                    ),
                                                                ],
                                                            ),
                                                        ),
                                                        Container(
                                                            width: 40,
                                                            child: Column(
                                                                mainAxisSize: MainAxisSize.min,
                                                                mainAxisAlignment: MainAxisAlignment.start,
                                                                crossAxisAlignment: CrossAxisAlignment.center,
                                                                children: [
                                                                    Text(
                                                                        '1',
                                                                        textAlign: TextAlign.center,
                                                                        style: TextStyle(
                                                                            color: const Color(0xFF201B16),
                                                                            fontSize: 18,
                                                                            fontFamily: 'Epilogue',
                                                                            fontWeight: FontWeight.w700,
                                                                            height: 1.33,
                                                                        ),
                                                                    ),
                                                                ],
                                                            ),
                                                        ),
                                                        Container(
                                                            width: 40,
                                                            height: 40,
                                                            decoration: ShapeDecoration(
                                                                color: const Color(0xFF9A442D),
                                                                shape: RoundedRectangleBorder(
                                                                    borderRadius: BorderRadius.circular(9999),
                                                                ),
                                                            ),
                                                            child: Row(
                                                                mainAxisSize: MainAxisSize.min,
                                                                mainAxisAlignment: MainAxisAlignment.center,
                                                                crossAxisAlignment: CrossAxisAlignment.center,
                                                                children: [
                                                                    Column(
                                                                        mainAxisSize: MainAxisSize.min,
                                                                        mainAxisAlignment: MainAxisAlignment.start,
                                                                        crossAxisAlignment: CrossAxisAlignment.center,
                                                                        children: [
                                                                        ,
                                                                        ],
                                                                    ),
                                                                ],
                                                            ),
                                                        ),
                                                    ],
                                                ),
                                            ),
                                        ),
                                    ],
                                ),
                            ),
                        ),
                    ],
                ),
            ),
            Positioned(
                left: 0,
                top: 0,
                child: Container(
                    width: 390,
                    decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.80),
                        boxShadow: [
                            BoxShadow(
                                color: Color(0x0C000000),
                                blurRadius: 2,
                                offset: Offset(0, 1),
                                spreadRadius: 0,
                            )
                        ],
                    ),
                    child: Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                            ConstrainedBox(
                                constraints: BoxConstraints(minHeight: 64),
                                child: Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 12),
                                    child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        crossAxisAlignment: CrossAxisAlignment.center,
                                        spacing: 59,
                                        children: [
                                            Container(
                                                padding: const EdgeInsets.all(8),
                                                decoration: ShapeDecoration(
                                                    shape: RoundedRectangleBorder(
                                                        borderRadius: BorderRadius.circular(9999),
                                                    ),
                                                ),
                                                child: Column(
                                                    mainAxisSize: MainAxisSize.min,
                                                    mainAxisAlignment: MainAxisAlignment.center,
                                                    crossAxisAlignment: CrossAxisAlignment.center,
                                                    children: [
                                                        Row(
                                                            mainAxisSize: MainAxisSize.min,
                                                            mainAxisAlignment: MainAxisAlignment.center,
                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                            children: [
                                                            ,
                                                            ],
                                                        ),
                                                    ],
                                                ),
                                            ),
                                            Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.start,
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                    Text(
                                                        'Chi tiết món',
                                                        style: TextStyle(
                                                            color: const Color(0xFF9A442D),
                                                            fontSize: 18,
                                                            fontFamily: 'Epilogue',
                                                            fontWeight: FontWeight.w700,
                                                            height: 1.33,
                                                        ),
                                                    ),
                                                ],
                                            ),
                                            Container(
                                                padding: const EdgeInsets.all(8),
                                                decoration: ShapeDecoration(
                                                    shape: RoundedRectangleBorder(
                                                        borderRadius: BorderRadius.circular(9999),
                                                    ),
                                                ),
                                                child: Column(
                                                    mainAxisSize: MainAxisSize.min,
                                                    mainAxisAlignment: MainAxisAlignment.center,
                                                    crossAxisAlignment: CrossAxisAlignment.center,
                                                    children: [
                                                        Row(
                                                            mainAxisSize: MainAxisSize.min,
                                                            mainAxisAlignment: MainAxisAlignment.center,
                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                            children: [
                                                            ,
                                                            ],
                                                        ),
                                                    ],
                                                ),
                                            ),
                                        ],
                                    ),
                                ),
                            ),
                        ],
                    ),
                ),
            ),
            Positioned(
                left: 0,
                top: 938,
                child: Container(
                    width: 390,
                    padding: const EdgeInsets.all(40),
                    decoration: ShapeDecoration(
                        color: Colors.white.withValues(alpha: 0.90),
                        shape: RoundedRectangleBorder(
                            side: BorderSide(
                                width: 1,
                                color: const Color(0xFFECE0D8),
                            ),
                        ),
                        shadows: [
                            BoxShadow(
                                color: Color(0x0C000000),
                                blurRadius: 16,
                                offset: Offset(0, -4),
                                spreadRadius: 0,
                            )
                        ],
                    ),
                    child: Row(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                            Expanded(
                                child: Container(
                                    height: 48,
                                    decoration: ShapeDecoration(
                                        color: const Color(0xFF9A442D),
                                        shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(9999),
                                        ),
                                    ),
                                    child: Stack(
                                        children: [
                                            Positioned(
                                                left: 0,
                                                top: 0,
                                                child: Container(
                                                    width: 310,
                                                    height: 48,
                                                    decoration: ShapeDecoration(
                                                        color: Colors.white.withValues(alpha: 0),
                                                        shape: RoundedRectangleBorder(
                                                            borderRadius: BorderRadius.circular(9999),
                                                        ),
                                                        shadows: [
                                                            BoxShadow(
                                                                color: Color(0x19000000),
                                                                blurRadius: 4,
                                                                offset: Offset(0, 2),
                                                                spreadRadius: -2,
                                                            )BoxShadow(
                                                                color: Color(0x19000000),
                                                                blurRadius: 6,
                                                                offset: Offset(0, 4),
                                                                spreadRadius: -1,
                                                            )
                                                        ],
                                                    ),
                                                ),
                                            ),
                                            Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.start,
                                                crossAxisAlignment: CrossAxisAlignment.center,
                                                children: [
                                                ,
                                                ],
                                            ),
                                            Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.start,
                                                crossAxisAlignment: CrossAxisAlignment.center,
                                                children: [
                                                    Text(
                                                        'Thêm vào giỏ hàng',
                                                        textAlign: TextAlign.center,
                                                        style: TextStyle(
                                                            color: Colors.white,
                                                            fontSize: 15,
                                                            fontFamily: 'Epilogue',
                                                            fontWeight: FontWeight.w700,
                                                            height: 1.33,
                                                        ),
                                                    ),
                                                ],
                                            ),
                                            Container(
                                                padding: const EdgeInsets.only(left: 8),
                                                child: Column(
                                                    mainAxisSize: MainAxisSize.min,
                                                    mainAxisAlignment: MainAxisAlignment.start,
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                        Container(
                                                            padding: const EdgeInsets.only(left: 8),
                                                            decoration: ShapeDecoration(
                                                                shape: RoundedRectangleBorder(
                                                                    side: BorderSide(
                                                                        width: 1,
                                                                        color: Colors.white.withValues(alpha: 0.30),
                                                                    ),
                                                                ),
                                                            ),
                                                            child: Column(
                                                                mainAxisSize: MainAxisSize.min,
                                                                mainAxisAlignment: MainAxisAlignment.start,
                                                                crossAxisAlignment: CrossAxisAlignment.center,
                                                                children: [
                                                                    Text(
                                                                        '65k',
                                                                        textAlign: TextAlign.center,
                                                                        style: TextStyle(
                                                                            color: Colors.white,
                                                                            fontSize: 16,
                                                                            fontFamily: 'Nimbus Sans',
                                                                            fontWeight: FontWeight.w400,
                                                                            height: 1.50,
                                                                        ),
                                                                    ),
                                                                ],
                                                            ),
                                                        ),
                                                    ],
                                                ),
                                            ),
                                        ],
                                    ),
                                ),
                            ),
                        ],
                    ),
                ),
            ),
        ],
    ),
)
// text styles
// Text(
//     'Phở Bò Đặc Biệt',
//     style: TextStyle(
//         color: const Color(0xFF201B16),
//         fontSize: 24,
//         fontFamily: 'Epilogue',
//         fontWeight: FontWeight.w700,
//         height: 1.33,
//     ),
// )
// // ---
// Text(
//     'Phổ biến',
//     style: TextStyle(
//         color: const Color(0xFF55423E),
//         fontSize: 12,
//         fontFamily: 'Epilogue',
//         fontWeight: FontWeight.w400,
//         height: 1.33,
//     ),
// )
// // ---
// Text(
//     'Must try',
//     style: TextStyle(
//         color: const Color(0xFF5B1604),
//         fontSize: 12,
//         fontFamily: 'Epilogue',
//         fontWeight: FontWeight.w400,
//         height: 1.33,
//     ),
// )
// // ---
// Text(
//     '65.000đ',
//     textAlign: TextAlign.right,
//     style: TextStyle(
//         color: const Color(0xFF9A442D),
//         fontSize: 24,
//         fontFamily: 'Epilogue',
//         fontWeight: FontWeight.w700,
//         height: 1.33,
//     ),
// )
// // ---
// Text(
//     'Phở bò truyền thống với nước dùng hầm\nxương bò 24h, thịt nạm giòn, tái mềm, gầu\nbéo ngậy. Kèm theo rau thơm, quẩy và\ncác gia vị đặc trưng.',
//     style: TextStyle(
//         color: const Color(0xFF55423E),
//         fontSize: 15,
//         fontFamily: 'Epilogue',
//         fontWeight: FontWeight.w400,
//         height: 1.47,
//     ),
// )
// // ---
// Text(
//     'Ghi chú cho đầu bếp',
//     style: TextStyle(
//         color: const Color(0xFF201B16),
//         fontSize: 18,
//         fontFamily: 'Epilogue',
//         fontWeight: FontWeight.w700,
//         height: 1.33,
//     ),
// )
// // ---
// Text(
//     'VD: Không hành, ít bánh phở, nước \nbéo...',
//     style: TextStyle(
//         color: const Color(0x7F55423E),
//         fontSize: 15,
//         fontFamily: 'Epilogue',
//         fontWeight: FontWeight.w400,
//         height: 1.47,
//     ),
// )
// // ---
// Text(
//     '1',
//     textAlign: TextAlign.center,
//     style: TextStyle(
//         color: const Color(0xFF201B16),
//         fontSize: 18,
//         fontFamily: 'Epilogue',
//         fontWeight: FontWeight.w700,
//         height: 1.33,
//     ),
// )
// // ---
// Text(
//     'Chi tiết món',
//     style: TextStyle(
//         color: const Color(0xFF9A442D),
//         fontSize: 18,
//         fontFamily: 'Epilogue',
//         fontWeight: FontWeight.w700,
//         height: 1.33,
//     ),
// )
// // ---
// Text(
//     'Thêm vào giỏ hàng',
//     textAlign: TextAlign.center,
//     style: TextStyle(
//         color: Colors.white,
//         fontSize: 15,
//         fontFamily: 'Epilogue',
//         fontWeight: FontWeight.w700,
//         height: 1.33,
//     ),
// )
// // ---
// Text(
//     '65k',
//     textAlign: TextAlign.center,
//     style: TextStyle(
//         color: Colors.white,
//         fontSize: 16,
//         fontFamily: 'Nimbus Sans',
//         fontWeight: FontWeight.w400,
//         height: 1.50,
//     ),
// )