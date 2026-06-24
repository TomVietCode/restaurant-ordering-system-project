Container(
    width: 390,
    height: 1487,
    decoration: BoxDecoration(color: Colors.white),
    child: Stack(
        children: [
            Positioned(
                left: 0,
                top: 64,
                child: Container(
                    width: 390,
                    padding: const EdgeInsets.only(
                        top: 20,
                        left: 40,
                        right: 40,
                        bottom: 12,
                    ),
                    child: Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                            Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                decoration: ShapeDecoration(
                                    color: const Color(0xFFFEF1E9),
                                    shape: RoundedRectangleBorder(
                                        side: BorderSide(
                                            width: 1,
                                            color: const Color(0xFFE2DBD2),
                                        ),
                                        borderRadius: BorderRadius.circular(9999),
                                    ),
                                ),
                                child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    children: [
                                        Container(
                                            padding: const EdgeInsets.only(right: 12),
                                            child: Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.start,
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                ,
                                                ],
                                            ),
                                        ),
                                        Expanded(
                                            child: Container(
                                                padding: const EdgeInsets.symmetric(vertical: 3),
                                                clipBehavior: Clip.antiAlias,
                                                decoration: BoxDecoration(),
                                                child: Column(
                                                    mainAxisSize: MainAxisSize.min,
                                                    mainAxisAlignment: MainAxisAlignment.start,
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                        Container(
                                                            width: double.infinity,
                                                            clipBehavior: Clip.antiAlias,
                                                            decoration: BoxDecoration(),
                                                            child: Column(
                                                                mainAxisSize: MainAxisSize.min,
                                                                mainAxisAlignment: MainAxisAlignment.start,
                                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                                children: [
                                                                    SizedBox(
                                                                        width: 246,
                                                                        child: Text(
                                                                            'Tìm kiếm món ăn...',
                                                                            style: TextStyle(
                                                                                color: const Color(0xFF55423E),
                                                                                fontSize: 15,
                                                                                fontFamily: 'Epilogue',
                                                                                fontWeight: FontWeight.w400,
                                                                            ),
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
                        ],
                    ),
                ),
            ),
            Positioned(
                left: 0,
                top: 205,
                child: Container(
                    width: 390,
                    padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
                    child: Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                            Container(
                                width: double.infinity,
                                clipBehavior: Clip.antiAlias,
                                decoration: ShapeDecoration(
                                    color: Colors.white,
                                    shape: RoundedRectangleBorder(
                                        side: BorderSide(
                                            width: 1,
                                            color: const Color(0xFFE2DBD2),
                                        ),
                                        borderRadius: BorderRadius.circular(12),
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
                                child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                        Container(
                                            width: double.infinity,
                                            height: 192,
                                            decoration: BoxDecoration(color: const Color(0xFFFEF1E9)),
                                            child: Stack(
                                                children: [
                                                    Expanded(
                                                        child: Container(
                                                            width: double.infinity,
                                                            clipBehavior: Clip.antiAlias,
                                                            decoration: BoxDecoration(
                                                                image: DecorationImage(
                                                                    image: NetworkImage("https://placehold.co/308x192"),
                                                                    fit: BoxFit.fill,
                                                                ),
                                                            ),
                                                        ),
                                                    ),
                                                    Positioned(
                                                        left: 12,
                                                        top: 12,
                                                        child: Container(
                                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                            decoration: ShapeDecoration(
                                                                color: Colors.white.withValues(alpha: 0.90),
                                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                                                            ),
                                                            child: Column(
                                                                mainAxisSize: MainAxisSize.min,
                                                                mainAxisAlignment: MainAxisAlignment.start,
                                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                                children: [
                                                                    Text(
                                                                        'BESTSELLER',
                                                                        style: TextStyle(
                                                                            color: const Color(0xFF9A442D),
                                                                            fontSize: 14,
                                                                            fontFamily: 'Epilogue',
                                                                            fontWeight: FontWeight.w700,
                                                                            height: 1.29,
                                                                        ),
                                                                    ),
                                                                ],
                                                            ),
                                                        ),
                                                    ),
                                                ],
                                            ),
                                        ),
                                        Container(
                                            width: double.infinity,
                                            padding: const EdgeInsets.all(16),
                                            child: Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                    Container(
                                                        width: double.infinity,
                                                        padding: const EdgeInsets.only(bottom: 8),
                                                        child: Column(
                                                            mainAxisSize: MainAxisSize.min,
                                                            mainAxisAlignment: MainAxisAlignment.start,
                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                            children: [
                                                                Container(
                                                                    width: double.infinity,
                                                                    child: Row(
                                                                        mainAxisSize: MainAxisSize.min,
                                                                        mainAxisAlignment: MainAxisAlignment.start,
                                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                                        children: [
                                                                            Text(
                                                                                'Phở Bò Đặc Biệt',
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
                                                            ],
                                                        ),
                                                    ),
                                                    Container(
                                                        width: double.infinity,
                                                        padding: const EdgeInsets.only(bottom: 16),
                                                        child: Column(
                                                            mainAxisSize: MainAxisSize.min,
                                                            mainAxisAlignment: MainAxisAlignment.start,
                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                            children: [
                                                                Container(
                                                                    width: double.infinity,
                                                                    clipBehavior: Clip.antiAlias,
                                                                    decoration: BoxDecoration(),
                                                                    child: Column(
                                                                        mainAxisSize: MainAxisSize.min,
                                                                        mainAxisAlignment: MainAxisAlignment.start,
                                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                                        children: [
                                                                            SizedBox(
                                                                                width: 276,
                                                                                child: Text(
                                                                                    'Nước dùng hầm xương 24h, thịt bò\nWagyu thượng hạng, kèm quẩy và rau',
                                                                                    style: TextStyle(
                                                                                        color: const Color(0xFF55423E),
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
                                                    Container(
                                                        width: double.infinity,
                                                        child: Row(
                                                            mainAxisSize: MainAxisSize.min,
                                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                            crossAxisAlignment: CrossAxisAlignment.center,
                                                            spacing: 130.28,
                                                            children: [
                                                                Column(
                                                                    mainAxisSize: MainAxisSize.min,
                                                                    mainAxisAlignment: MainAxisAlignment.start,
                                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                                    children: [
                                                                        Text(
                                                                            '125.000₫',
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
                                                                Container(
                                                                    width: 40,
                                                                    height: 40,
                                                                    decoration: ShapeDecoration(
                                                                        color: const Color(0xFF9A442D),
                                                                        shape: RoundedRectangleBorder(
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
                                                ],
                                            ),
                                        ),
                                    ],
                                ),
                            ),
                            Container(
                                width: double.infinity,
                                clipBehavior: Clip.antiAlias,
                                decoration: ShapeDecoration(
                                    color: Colors.white,
                                    shape: RoundedRectangleBorder(
                                        side: BorderSide(
                                            width: 1,
                                            color: const Color(0xFFE2DBD2),
                                        ),
                                        borderRadius: BorderRadius.circular(12),
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
                                child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                        Container(
                                            width: double.infinity,
                                            height: 192,
                                            decoration: BoxDecoration(color: const Color(0xFFFEF1E9)),
                                            child: Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.center,
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                    Expanded(
                                                        child: Container(
                                                            width: double.infinity,
                                                            clipBehavior: Clip.antiAlias,
                                                            decoration: BoxDecoration(
                                                                image: DecorationImage(
                                                                    image: NetworkImage("https://placehold.co/308x192"),
                                                                    fit: BoxFit.fill,
                                                                ),
                                                            ),
                                                        ),
                                                    ),
                                                ],
                                            ),
                                        ),
                                        Container(
                                            width: double.infinity,
                                            padding: const EdgeInsets.all(16),
                                            child: Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                    Container(
                                                        width: double.infinity,
                                                        padding: const EdgeInsets.only(bottom: 8),
                                                        child: Column(
                                                            mainAxisSize: MainAxisSize.min,
                                                            mainAxisAlignment: MainAxisAlignment.start,
                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                            children: [
                                                                Container(
                                                                    width: double.infinity,
                                                                    child: Row(
                                                                        mainAxisSize: MainAxisSize.min,
                                                                        mainAxisAlignment: MainAxisAlignment.start,
                                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                                        children: [
                                                                            Text(
                                                                                'Cơm Tấm Sườn Bì',
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
                                                            ],
                                                        ),
                                                    ),
                                                    Container(
                                                        width: double.infinity,
                                                        padding: const EdgeInsets.only(bottom: 16),
                                                        child: Column(
                                                            mainAxisSize: MainAxisSize.min,
                                                            mainAxisAlignment: MainAxisAlignment.start,
                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                            children: [
                                                                Container(
                                                                    width: double.infinity,
                                                                    clipBehavior: Clip.antiAlias,
                                                                    decoration: BoxDecoration(),
                                                                    child: Column(
                                                                        mainAxisSize: MainAxisSize.min,
                                                                        mainAxisAlignment: MainAxisAlignment.start,
                                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                                        children: [
                                                                            SizedBox(
                                                                                width: 276,
                                                                                child: Text(
                                                                                    'Sườn cốt lết nướng than hoa, bì heo\nthái chỉ dẻo thơm, chả trứng hấp…',
                                                                                    style: TextStyle(
                                                                                        color: const Color(0xFF55423E),
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
                                                    Container(
                                                        width: double.infinity,
                                                        child: Row(
                                                            mainAxisSize: MainAxisSize.min,
                                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                            crossAxisAlignment: CrossAxisAlignment.center,
                                                            spacing: 140.30,
                                                            children: [
                                                                Column(
                                                                    mainAxisSize: MainAxisSize.min,
                                                                    mainAxisAlignment: MainAxisAlignment.start,
                                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                                    children: [
                                                                        Text(
                                                                            '85.000₫',
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
                                                                Container(
                                                                    width: 40,
                                                                    height: 40,
                                                                    decoration: ShapeDecoration(
                                                                        color: const Color(0xFF9A442D),
                                                                        shape: RoundedRectangleBorder(
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
                                                ],
                                            ),
                                        ),
                                    ],
                                ),
                            ),
                            Container(
                                width: double.infinity,
                                clipBehavior: Clip.antiAlias,
                                decoration: ShapeDecoration(
                                    color: Colors.white,
                                    shape: RoundedRectangleBorder(
                                        side: BorderSide(
                                            width: 1,
                                            color: const Color(0xFFE2DBD2),
                                        ),
                                        borderRadius: BorderRadius.circular(12),
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
                                child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                        Container(
                                            width: double.infinity,
                                            height: 192,
                                            decoration: BoxDecoration(color: const Color(0xFFFEF1E9)),
                                            child: Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.center,
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                    Expanded(
                                                        child: Container(
                                                            width: double.infinity,
                                                            clipBehavior: Clip.antiAlias,
                                                            decoration: BoxDecoration(
                                                                image: DecorationImage(
                                                                    image: NetworkImage("https://placehold.co/308x192"),
                                                                    fit: BoxFit.fill,
                                                                ),
                                                            ),
                                                        ),
                                                    ),
                                                ],
                                            ),
                                        ),
                                        Container(
                                            width: double.infinity,
                                            padding: const EdgeInsets.all(16),
                                            child: Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                    Container(
                                                        width: double.infinity,
                                                        padding: const EdgeInsets.only(bottom: 8),
                                                        child: Column(
                                                            mainAxisSize: MainAxisSize.min,
                                                            mainAxisAlignment: MainAxisAlignment.start,
                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                            children: [
                                                                Container(
                                                                    width: double.infinity,
                                                                    child: Row(
                                                                        mainAxisSize: MainAxisSize.min,
                                                                        mainAxisAlignment: MainAxisAlignment.start,
                                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                                        children: [
                                                                            Text(
                                                                                'Bún Chả Hà Nội',
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
                                                            ],
                                                        ),
                                                    ),
                                                    Container(
                                                        width: double.infinity,
                                                        padding: const EdgeInsets.only(bottom: 16),
                                                        child: Column(
                                                            mainAxisSize: MainAxisSize.min,
                                                            mainAxisAlignment: MainAxisAlignment.start,
                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                            children: [
                                                                Container(
                                                                    width: double.infinity,
                                                                    clipBehavior: Clip.antiAlias,
                                                                    decoration: BoxDecoration(),
                                                                    child: Column(
                                                                        mainAxisSize: MainAxisSize.min,
                                                                        mainAxisAlignment: MainAxisAlignment.start,
                                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                                        children: [
                                                                            SizedBox(
                                                                                width: 276,
                                                                                child: Text(
                                                                                    'Thịt nướng than hoa thơm lừng, nước\nchấm chua ngọt pha chuẩn vị truyền',
                                                                                    style: TextStyle(
                                                                                        color: const Color(0xFF55423E),
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
                                                    Container(
                                                        width: double.infinity,
                                                        child: Row(
                                                            mainAxisSize: MainAxisSize.min,
                                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                            crossAxisAlignment: CrossAxisAlignment.center,
                                                            spacing: 141.30,
                                                            children: [
                                                                Column(
                                                                    mainAxisSize: MainAxisSize.min,
                                                                    mainAxisAlignment: MainAxisAlignment.start,
                                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                                    children: [
                                                                        Text(
                                                                            '95.000₫',
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
                                                                Container(
                                                                    width: 40,
                                                                    height: 40,
                                                                    decoration: ShapeDecoration(
                                                                        color: const Color(0xFF9A442D),
                                                                        shape: RoundedRectangleBorder(
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
                left: 0,
                top: 146,
                child: Container(
                    width: 390,
                    padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 12),
                    clipBehavior: Clip.antiAlias,
                    decoration: BoxDecoration(color: const Color(0xE5FAF8F5)),
                    child: Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                            Container(
                                decoration: ShapeDecoration(
                                    shape: RoundedRectangleBorder(
                                        side: BorderSide(
                                            width: 1,
                                            color: const Color(0xFFF2E6DE),
                                        ),
                                    ),
                                ),
                                child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                        Container(
                                            height: double.infinity,
                                            padding: const EdgeInsets.only(top: 2, bottom: 10),
                                            decoration: ShapeDecoration(
                                                shape: RoundedRectangleBorder(
                                                    side: BorderSide(
                                                        width: 2,
                                                        color: const Color(0xFF9A442D),
                                                    ),
                                                ),
                                            ),
                                            child: Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.start,
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                    Text(
                                                        'Món chính',
                                                        style: TextStyle(
                                                            color: const Color(0xFF9A442D),
                                                            fontSize: 15,
                                                            fontFamily: 'Epilogue',
                                                            fontWeight: FontWeight.w700,
                                                            height: 1.33,
                                                        ),
                                                    ),
                                                ],
                                            ),
                                        ),
                                        Container(
                                            height: double.infinity,
                                            padding: const EdgeInsets.only(left: 24),
                                            child: Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.center,
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                    Expanded(
                                                        child: Container(
                                                            padding: const EdgeInsets.only(top: 2, bottom: 10),
                                                            decoration: ShapeDecoration(
                                                                shape: RoundedRectangleBorder(
                                                                    side: BorderSide(
                                                                        width: 2,
                                                                        color: Colors.black.withValues(alpha: 0),
                                                                    ),
                                                                ),
                                                            ),
                                                            child: Column(
                                                                mainAxisSize: MainAxisSize.min,
                                                                mainAxisAlignment: MainAxisAlignment.start,
                                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                                children: [
                                                                    Text(
                                                                        'Khai vị',
                                                                        style: TextStyle(
                                                                            color: const Color(0xFF55423E),
                                                                            fontSize: 15,
                                                                            fontFamily: 'Epilogue',
                                                                            fontWeight: FontWeight.w700,
                                                                            height: 1.33,
                                                                        ),
                                                                    ),
                                                                ],
                                                            ),
                                                        ),
                                                    ),
                                                ],
                                            ),
                                        ),
                                        Container(
                                            height: double.infinity,
                                            padding: const EdgeInsets.only(left: 24),
                                            child: Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.center,
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                    Expanded(
                                                        child: Container(
                                                            padding: const EdgeInsets.only(top: 2, bottom: 10),
                                                            decoration: ShapeDecoration(
                                                                shape: RoundedRectangleBorder(
                                                                    side: BorderSide(
                                                                        width: 2,
                                                                        color: Colors.black.withValues(alpha: 0),
                                                                    ),
                                                                ),
                                                            ),
                                                            child: Column(
                                                                mainAxisSize: MainAxisSize.min,
                                                                mainAxisAlignment: MainAxisAlignment.start,
                                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                                children: [
                                                                    Text(
                                                                        'Đồ uống',
                                                                        style: TextStyle(
                                                                            color: const Color(0xFF55423E),
                                                                            fontSize: 15,
                                                                            fontFamily: 'Epilogue',
                                                                            fontWeight: FontWeight.w700,
                                                                            height: 1.33,
                                                                        ),
                                                                    ),
                                                                ],
                                                            ),
                                                        ),
                                                    ),
                                                ],
                                            ),
                                        ),
                                        Container(
                                            height: double.infinity,
                                            padding: const EdgeInsets.only(left: 24),
                                            child: Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.center,
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                    Expanded(
                                                        child: Container(
                                                            padding: const EdgeInsets.only(top: 2, bottom: 10),
                                                            decoration: ShapeDecoration(
                                                                shape: RoundedRectangleBorder(
                                                                    side: BorderSide(
                                                                        width: 2,
                                                                        color: Colors.black.withValues(alpha: 0),
                                                                    ),
                                                                ),
                                                            ),
                                                            child: Column(
                                                                mainAxisSize: MainAxisSize.min,
                                                                mainAxisAlignment: MainAxisAlignment.start,
                                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                                children: [
                                                                    Text(
                                                                        'Tráng miệng',
                                                                        style: TextStyle(
                                                                            color: const Color(0xFF55423E),
                                                                            fontSize: 15,
                                                                            fontFamily: 'Epilogue',
                                                                            fontWeight: FontWeight.w700,
                                                                            height: 1.33,
                                                                        ),
                                                                    ),
                                                                ],
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
                            Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 12),
                                child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    spacing: 84.60,
                                    children: [
                                        Container(
                                            padding: const EdgeInsets.all(8),
                                            decoration: ShapeDecoration(
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
                                        Column(
                                            mainAxisSize: MainAxisSize.min,
                                            mainAxisAlignment: MainAxisAlignment.start,
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                                Text(
                                                    'Bàn 05',
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
                        ],
                    ),
                ),
            ),
            Positioned(
                left: 0,
                top: 1362,
                child: Container(
                    width: 390,
                    height: 125,
                    decoration: ShapeDecoration(
                        color: Colors.white,
                        shape: RoundedRectangleBorder(
                            side: BorderSide(
                                width: 1,
                                color: const Color(0xFFE2DBD2),
                            ),
                            borderRadius: BorderRadius.only(
                                topLeft: Radius.circular(12),
                                topRight: Radius.circular(12),
                            ),
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
                    child: Stack(
                        children: [
                            Positioned(
                                left: 16,
                                top: 17,
                                child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
                                    decoration: ShapeDecoration(
                                        color: const Color(0xFFE07A5F),
                                        shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(9999),
                                        ),
                                    ),
                                    child: Column(
                                        mainAxisSize: MainAxisSize.min,
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        crossAxisAlignment: CrossAxisAlignment.center,
                                        children: [
                                            Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.start,
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                ,
                                                ],
                                            ),
                                            Container(
                                                padding: const EdgeInsets.only(top: 4, right: 21.23),
                                                child: Column(
                                                    mainAxisSize: MainAxisSize.min,
                                                    mainAxisAlignment: MainAxisAlignment.start,
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                        Text(
                                                            'Thực\nđơn',
                                                            style: TextStyle(
                                                                color: const Color(0xFF5B1604),
                                                                fontSize: 15,
                                                                fontFamily: 'Epilogue',
                                                                fontWeight: FontWeight.w700,
                                                                height: 1.33,
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
                                left: 123.06,
                                top: 12,
                                child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                    decoration: ShapeDecoration(
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    child: Column(
                                        mainAxisSize: MainAxisSize.min,
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        crossAxisAlignment: CrossAxisAlignment.center,
                                        children: [
                                            Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.start,
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                ,
                                                ],
                                            ),
                                            Container(
                                                padding: const EdgeInsets.only(top: 4, right: 19.18),
                                                child: Column(
                                                    mainAxisSize: MainAxisSize.min,
                                                    mainAxisAlignment: MainAxisAlignment.start,
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                        Text(
                                                            'Tìm\nkiếm',
                                                            style: TextStyle(
                                                                color: const Color(0xFF55423E),
                                                                fontSize: 15,
                                                                fontFamily: 'Epilogue',
                                                                fontWeight: FontWeight.w700,
                                                                height: 1.33,
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
                                left: 297.80,
                                top: 11,
                                child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                    decoration: ShapeDecoration(
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    child: Column(
                                        mainAxisSize: MainAxisSize.min,
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        crossAxisAlignment: CrossAxisAlignment.center,
                                        children: [
                                            Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.start,
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                ,
                                                ],
                                            ),
                                            Container(
                                                padding: const EdgeInsets.only(top: 4, right: 13.17),
                                                child: Column(
                                                    mainAxisSize: MainAxisSize.min,
                                                    mainAxisAlignment: MainAxisAlignment.start,
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                        Text(
                                                            'Lịch\nsử',
                                                            style: TextStyle(
                                                                color: const Color(0xFF55423E),
                                                                fontSize: 15,
                                                                fontFamily: 'Epilogue',
                                                                fontWeight: FontWeight.w700,
                                                                height: 1.33,
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
                                left: 210.52,
                                top: 11,
                                child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                    decoration: ShapeDecoration(
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    child: Stack(
                                        children: [
                                            Column(
                                                mainAxisSize: MainAxisSize.min,
                                                mainAxisAlignment: MainAxisAlignment.start,
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                ,
                                                ],
                                            ),
                                            Container(
                                                padding: const EdgeInsets.only(top: 4, right: 17.05),
                                                child: Column(
                                                    mainAxisSize: MainAxisSize.min,
                                                    mainAxisAlignment: MainAxisAlignment.start,
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                        Text(
                                                            'Giỏ\nhàng',
                                                            style: TextStyle(
                                                                color: const Color(0xFF55423E),
                                                                fontSize: 15,
                                                                fontFamily: 'Epilogue',
                                                                fontWeight: FontWeight.w700,
                                                                height: 1.33,
                                                            ),
                                                        ),
                                                    ],
                                                ),
                                            ),
                                            Positioned(
                                                left: 63.28,
                                                top: 4,
                                                child: Container(
                                                    width: 16,
                                                    height: 16,
                                                    padding: const EdgeInsets.only(bottom: 1),
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
                                                            Text(
                                                                '2',
                                                                textAlign: TextAlign.center,
                                                                style: TextStyle(
                                                                    color: Colors.white,
                                                                    fontSize: 10,
                                                                    fontFamily: 'Nimbus Sans',
                                                                    fontWeight: FontWeight.w700,
                                                                    height: 1.50,
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
            ),
        ],
    ),
)