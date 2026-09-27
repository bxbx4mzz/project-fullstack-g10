-- Seed catalog: 5 sample products with variants, for the team to view/edit while testing
-- the real Product/Variant API. Safe to re-run against an empty catalog.

INSERT INTO products (name, description, price, image_url, category, stock, created_at, updated_at) VALUES
('ชุดราตรีสีดำ', 'ชุดราตรียาวสีดำ ผ้าซาตินเนื้อดี', 350.00, '👗', 'dress', 6, now(), now()),
('สูทสีเทา', 'สูทตัดเข้ารูป เหมาะกับงานทางการ', 420.00, '🤵', 'shirt', 4, now(), now()),
('ชุดไทยจิตรลดา', 'ชุดไทยจิตรลดาสีสุภาพ ใส่ในงานพิธี', 590.00, '👘', 'dress', 2, now(), now()),
('เดรสลายดอก', 'เดรสลายดอกไม้ ผ้าเนื้อบาง ใส่สบาย', 280.00, '👚', 'dress', 6, now(), now()),
('ทักซิโด้', 'ทักซิโด้สีดำคลาสสิก', 480.00, '🎩', 'shirt', 3, now(), now());

INSERT INTO product_variants (product_id, sku, size, color, stock_qty, price3day, price5day, price7day, extra_day_price)
SELECT id, 'SKU-' || upper(substr(md5(random()::text), 1, 8)), v.size, v.color, v.stock_qty, v.p3, v.p5, v.p7, v.extra
FROM products p
JOIN LATERAL (
  VALUES
    ('S', 'ดำ', 2, 300.00, 500.00, 700.00, 50.00),
    ('M', 'ดำ', 2, 300.00, 500.00, 700.00, 50.00),
    ('L', 'ดำ', 2, 300.00, 500.00, 700.00, 50.00)
) AS v(size, color, stock_qty, p3, p5, p7, extra) ON true
WHERE p.name = 'ชุดราตรีสีดำ';

INSERT INTO product_variants (product_id, sku, size, color, stock_qty, price3day, price5day, price7day, extra_day_price)
SELECT id, 'SKU-' || upper(substr(md5(random()::text), 1, 8)), v.size, v.color, v.stock_qty, v.p3, v.p5, v.p7, v.extra
FROM products p
JOIN LATERAL (
  VALUES
    ('M', 'เทา', 2, 350.00, 580.00, 800.00, 60.00),
    ('L', 'เทา', 2, 350.00, 580.00, 800.00, 60.00)
) AS v(size, color, stock_qty, p3, p5, p7, extra) ON true
WHERE p.name = 'สูทสีเทา';

INSERT INTO product_variants (product_id, sku, size, color, stock_qty, price3day, price5day, price7day, extra_day_price)
SELECT id, 'SKU-' || upper(substr(md5(random()::text), 1, 8)), v.size, v.color, v.stock_qty, v.p3, v.p5, v.p7, v.extra
FROM products p
JOIN LATERAL (
  VALUES
    ('Free Size', 'ครีม', 2, 480.00, 780.00, 1050.00, 90.00)
) AS v(size, color, stock_qty, p3, p5, p7, extra) ON true
WHERE p.name = 'ชุดไทยจิตรลดา';

INSERT INTO product_variants (product_id, sku, size, color, stock_qty, price3day, price5day, price7day, extra_day_price)
SELECT id, 'SKU-' || upper(substr(md5(random()::text), 1, 8)), v.size, v.color, v.stock_qty, v.p3, v.p5, v.p7, v.extra
FROM products p
JOIN LATERAL (
  VALUES
    ('S', 'ชมพู', 3, 250.00, 400.00, 550.00, 40.00),
    ('M', 'ฟ้า', 3, 250.00, 400.00, 550.00, 40.00)
) AS v(size, color, stock_qty, p3, p5, p7, extra) ON true
WHERE p.name = 'เดรสลายดอก';

INSERT INTO product_variants (product_id, sku, size, color, stock_qty, price3day, price5day, price7day, extra_day_price)
SELECT id, 'SKU-' || upper(substr(md5(random()::text), 1, 8)), v.size, v.color, v.stock_qty, v.p3, v.p5, v.p7, v.extra
FROM products p
JOIN LATERAL (
  VALUES
    ('L', 'ดำ', 2, 400.00, 650.00, 900.00, 70.00),
    ('XL', 'ดำ', 1, 400.00, 650.00, 900.00, 70.00)
) AS v(size, color, stock_qty, p3, p5, p7, extra) ON true
WHERE p.name = 'ทักซิโด้';
