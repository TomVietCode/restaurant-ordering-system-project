-- Xóa dữ liệu cũ (giữ nguyên cấu trúc bảng)
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM items;
DELETE FROM categories;

-- Reset sequence
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE items_id_seq RESTART WITH 1;

-- =============================================
-- 5 DANH MỤC
-- =============================================
INSERT INTO categories (name, description) VALUES
('Khai Vị', 'Các món ăn nhẹ, khai vị trước bữa chính'),
('Món Chính', 'Cơm, phở, bún và các món ăn no'),
('Lẩu & Nướng', 'Lẩu nóng hổi và đồ nướng thơm lừng'),
('Đồ Uống', 'Nước giải khát, cà phê, trà, sinh tố'),
('Tráng Miệng', 'Chè, bánh ngọt và trái cây tươi');

-- =============================================
-- 40 MÓN ĂN (8 món mỗi danh mục)
-- =============================================

-- === KHAI VỊ (category_id = 1) ===
INSERT INTO items (name, price, images_url, description, is_remain, category_id) VALUES
('Gỏi Cuốn Tôm Thịt', 45000, '["https://images.unsplash.com/photo-1562967916-eb82221dfb44?w=500&q=80"]', 'Gỏi cuốn tươi với tôm, thịt heo, bún và rau sống', true, 1),
('Chả Giò Sài Gòn', 55000, '["https://images.unsplash.com/photo-1607330289024-1535c6b4e1c1?w=500&q=80"]', 'Chả giò chiên giòn vàng ươm, nhân thịt heo và nấm', true, 1),
('Bánh Khọt Vũng Tàu', 60000, '["https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500&q=80"]', 'Bánh khọt giòn rụm, ăn kèm rau sống và nước mắm chua ngọt', true, 1),
('Súp Bào Ngư Hải Sản', 85000, '["https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&q=80"]', 'Súp bào ngư nấu với nấm đông cô và hải sản tươi', true, 1),
('Salad Trộn Kiểu Thái', 50000, '["https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80"]', 'Salad tôm chua cay kiểu Thái với sốt chanh dây', true, 1),
('Đậu Hũ Chiên Sả Ớt', 40000, '["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80"]', 'Đậu hũ chiên giòn xào sả ớt thơm nức', true, 1),
('Cánh Gà Chiên Nước Mắm', 65000, '["https://images.unsplash.com/photo-1527477396000-e27163b4bdb1?w=500&q=80"]', 'Cánh gà chiên giòn rim nước mắm tỏi ớt', true, 1),
('Hàu Nướng Mỡ Hành', 90000, '["https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=500&q=80"]', 'Hàu tươi nướng mỡ hành và đậu phộng rang', true, 1),

-- === MÓN CHÍNH (category_id = 2) ===
('Phở Bò Tái Nạm', 75000, '["https://images.unsplash.com/photo-1582878826629-29b7ad1cb438?w=500&q=80"]', 'Phở bò truyền thống với nước dùng hầm xương 12 tiếng', true, 2),
('Bún Chả Hà Nội', 65000, '["https://images.unsplash.com/photo-1626804475297-41609ea074eb?w=500&q=80"]', 'Bún chả thịt nướng than hoa, ăn kèm rau sống', true, 2),
('Cơm Tấm Sườn Bì Chả', 80000, '["https://images.unsplash.com/photo-1623910271018-ce80ec210f92?w=500&q=80"]', 'Cơm tấm Sài Gòn đặc biệt với sườn, bì và chả trứng', true, 2),
('Bún Bò Huế', 70000, '["https://images.unsplash.com/photo-1576577445504-6af96477db52?w=500&q=80"]', 'Bún bò Huế cay nồng đặc trưng xứ cố đô', true, 2),
('Cơm Chiên Dương Châu', 65000, '["https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80"]', 'Cơm chiên với tôm, lạp xưởng, trứng và rau củ', true, 2),
('Mì Xào Hải Sản', 85000, '["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&q=80"]', 'Mì xào giòn với tôm, mực và rau xanh', true, 2),
('Gà Rán Sốt Cay Hàn Quốc', 90000, '["https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80"]', 'Gà chiên giòn phủ sốt cay ngọt Hàn Quốc', true, 2),
('Cá Lóc Kho Tộ', 95000, '["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80"]', 'Cá lóc kho tộ đậm đà, ăn kèm cơm trắng nóng', true, 2),

-- === LẨU & NƯỚNG (category_id = 3) ===
('Lẩu Thái Tomyum Hải Sản', 280000, '["https://images.unsplash.com/photo-1555126634-ae23443a53e5?w=500&q=80"]', 'Lẩu Thái chua cay với tôm, mực, nghêu và nấm', true, 3),
('Lẩu Gà Lá É', 250000, '["https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&q=80"]', 'Lẩu gà ta nấu với lá é thơm, vị ngọt thanh tự nhiên', true, 3),
('Lẩu Bò Nhúng Giấm', 300000, '["https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=500&q=80"]', 'Lẩu bò nhúng giấm chua nhẹ, ăn kèm bún và rau', true, 3),
('Sườn Nướng BBQ', 120000, '["https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80"]', 'Sườn heo nướng BBQ mật ong, thơm lừng bếp than', true, 3),
('Bò Nướng Lá Lốt', 95000, '["https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&q=80"]', 'Bò cuốn lá lốt nướng thơm, ăn kèm bún và rau', true, 3),
('Tôm Nướng Muối Ớt', 150000, '["https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80"]', 'Tôm sú nướng muối ớt xanh, vỏ giòn thịt ngọt', true, 3),
('Mực Nướng Sa Tế', 130000, '["https://images.unsplash.com/photo-1559847844-5315695dadae?w=500&q=80"]', 'Mực tươi nướng sa tế thơm lừng, dai giòn sần sật', true, 3),
('Combo Nướng Hỗn Hợp', 350000, '["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80"]', 'Combo bò, heo, gà, tôm nướng cho 2-3 người', true, 3),

-- === ĐỒ UỐNG (category_id = 4) ===
('Trà Đào Cam Sả', 45000, '["https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80"]', 'Trà đào thanh mát với cam tươi và sả thơm', true, 4),
('Cà Phê Sữa Đá', 35000, '["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80"]', 'Cà phê phin Việt Nam đậm đà với sữa đặc', true, 4),
('Sinh Tố Bơ', 50000, '["https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&q=80"]', 'Sinh tố bơ sáp béo ngậy, thêm sữa đặc', true, 4),
('Nước Ép Cam Tươi', 40000, '["https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&q=80"]', 'Cam vắt tươi 100%, không thêm đường', true, 4),
('Trà Sữa Trân Châu', 55000, '["https://images.unsplash.com/photo-1558857563-b37102e96041?w=500&q=80"]', 'Trà sữa oolong với trân châu đen dẻo mềm', true, 4),
('Bia Tiger', 30000, '["https://images.unsplash.com/photo-1614315584061-689360c75cce?w=500&q=80"]', 'Bia Tiger chai 330ml ướp lạnh', true, 4),
('Mojito Chanh Bạc Hà', 60000, '["https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500&q=80"]', 'Mojito không cồn với chanh tươi và bạc hà', true, 4),
('Nước Dừa Tươi', 35000, '["https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=500&q=80"]', 'Nước dừa xiêm tươi nguyên trái, mát lạnh', true, 4),

-- === TRÁNG MIỆNG (category_id = 5) ===
('Chè Bưởi', 30000, '["https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&q=80"]', 'Chè bưởi cốt dừa thơm béo, mát lịm', true, 5),
('Bánh Flan Caramen', 25000, '["https://images.unsplash.com/photo-1605697686566-f1388653fb8b?w=500&q=80"]', 'Bánh flan mịn màng với caramen đắng nhẹ', true, 5),
('Kem Dừa Trái Dừa', 55000, '["https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=500&q=80"]', 'Kem dừa tươi phục vụ trong trái dừa non', true, 5),
('Chè Thái', 35000, '["https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&q=80"]', 'Chè Thái nhiều topping: thạch, trái cây và nước cốt dừa', true, 5),
('Rau Câu Dừa', 20000, '["https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&q=80"]', 'Rau câu dừa hai lớp mát lạnh, dai giòn', true, 5),
('Trái Cây Tươi Thập Cẩm', 45000, '["https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=500&q=80"]', 'Dĩa trái cây theo mùa: xoài, dưa hấu, thanh long, dứa', true, 5),
('Bánh Chuối Nướng', 30000, '["https://images.unsplash.com/photo-1571115177098-24de17e889a9?w=500&q=80"]', 'Bánh chuối nướng nóng hổi, thơm bùi hương chuối', true, 5),
('Sữa Chua Nếp Cẩm', 30000, '["https://images.unsplash.com/photo-1488900128323-21503983a07e?w=500&q=80"]', 'Sữa chua mịn màng kết hợp nếp cẩm dẻo thơm', true, 5);
