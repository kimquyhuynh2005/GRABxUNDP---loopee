-- ============================================================
-- LOOPEE — Seed Data
-- Paste vào Supabase SQL Editor và bấm Run
-- ============================================================

-- ① CATEGORIES
insert into categories (id, name, icon_url) values
  (1, 'Phở & Bún', null),
  (2, 'Cơm',      null),
  (3, 'Đồ Ăn Nhanh', null);

-- ② USER — Nguyễn Minh Khoa
insert into users (id, name, email, total_orders, points, plastic_reduction_pct, co2_offset_kg)
values (
  '11111111-1111-1111-1111-111111111111',
  'Nguyễn Minh Khoa',
  'minkhoa@loopee.vn',
  10,
  1240,
  85,
  4.2
);

-- ③ MILESTONES
insert into milestones (id, orders_required, points_reward, label) values
  (1,  5,  20,  'First Loop'),
  (2, 10,  50,  'Eco Warrior'),
  (3, 20, 100,  'Green Champion');

-- ④ USER MILESTONES
--    Milestone 5-orders: đã claim
--    Milestone 10-orders: reached nhưng chưa claim
insert into user_milestones (user_id, milestone_id, reached_at, claimed_at, is_claimed) values
  (
    '11111111-1111-1111-1111-111111111111', 1,
    now() - interval '10 days',
    now() - interval '9 days',
    true
  ),
  (
    '11111111-1111-1111-1111-111111111111', 2,
    now() - interval '1 day',
    null,
    false
  );

-- ⑤ RESTAURANTS
insert into restaurants (id, name, address, distance_km, rating, rating_count, delivery_time_min, category_id, is_eco_partner, is_editors_pick)
values
  (
    '22222222-2222-2222-2222-222222222221',
    'Phở Cuốn Hương Mai',
    '18 Trích Sài, Tây Hồ, Hà Nội',
    1.5, 4.8, 312, 25,
    1, true, true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Bún Riêu Cô Ba',
    '74 Đinh Tiên Hoàng, Quận 1, TP.HCM',
    2.1, 4.6, 198, 30,
    1, true, false
  ),
  (
    '22222222-2222-2222-2222-222222222223',
    'Cơm Tấm Chị Bảy',
    '12 Võ Văn Tần, Quận 3, TP.HCM',
    2.5, 4.9, 540, 20,
    2, true, true
  );

-- ⑥ ORDERS
--    Order 0031: delivered, deadline đã qua 6h → reward_pct = 100 - (6×4) = 76
--    Order 0032: out_for_delivery, deadline còn 24h → reward_pct = 100
insert into orders (id, order_code, user_id, restaurant_name, status, eco_box_count, return_deadline, reward_pct)
values
  (
    '33333333-3333-3333-3333-333333333331',
    'GL-20260626-0031',
    '11111111-1111-1111-1111-111111111111',
    'Urban Kitchen – Quận 3',
    'delivered',
    2,
    now() - interval '6 hours',
    76
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    'GL-20260626-0032',
    '11111111-1111-1111-1111-111111111111',
    'Bún Chả – Quận 1',
    'out_for_delivery',
    1,
    now() + interval '24 hours',
    100
  );

-- ⑦ RETURN TOKENS (QR code)
insert into return_tokens (id, order_id, user_id, token_code, is_used)
values
  (
    '66666666-6666-6666-6666-666666666661',
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111111',
    'LOOP-0031-XK7M2P',
    false
  ),
  (
    '66666666-6666-6666-6666-666666666662',
    '33333333-3333-3333-3333-333333333332',
    '11111111-1111-1111-1111-111111111111',
    'LOOP-0032-BN4QR8',
    false
  );

-- ⑧ GREEN STATIONS
insert into green_stations (id, name, address, district, lat, lng, capacity, current_load, status)
values
  (
    '44444444-4444-4444-4444-444444444441',
    'Poki Bowl',
    '42 Lê Lợi',
    'Quận 1',
    10.7731, 106.7030,
    20, 8, 'available'
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    'GS25',
    '55 Nguyễn Đình Chiểu',
    'Quận 3',
    10.7769, 106.6896,
    20, 20, 'full'
  );

-- ⑨ VOUCHERS
insert into vouchers (id, title, description, category, discount_type, discount_value, min_order_value, applicable_to, expires_at, icon_type)
values
  (
    '55555555-5555-5555-5555-555555555551',
    '₫35.000 OFF Rice Bowl',
    'Giảm ₫35.000 cho đơn Rice Bowl',
    'loopee_dine_in',
    'fixed', 35000, null,
    'Poki Bowl · Urban Kitchen',
    '2026-07-31',
    'restaurant'
  ),
  (
    '55555555-5555-5555-5555-555555555552',
    '₫46.000 OFF đơn từ ₫200.000',
    'Giảm ₫46.000 cho đơn từ ₫200.000',
    'loopee_dine_in',
    'fixed', 46000, 200000,
    'Tất cả merchants Loopee',
    '2026-08-15',
    'restaurant'
  ),
  (
    '55555555-5555-5555-5555-555555555553',
    'Free Delivery',
    'Miễn phí giao hàng',
    'loopee_dine_in',
    'free_delivery', null, null,
    'Tất cả merchants Loopee',
    '2026-08-01',
    'restaurant'
  ),
  (
    '55555555-5555-5555-5555-555555555554',
    '15% OFF In-Store',
    'Giảm 15% mua tại cửa hàng',
    'chtl_eco_partner',
    'percentage', 15, null,
    'GS25 · FamilyMart',
    '2026-07-15',
    'store'
  );

-- ⑩ USER VOUCHERS — gắn 4 vouchers với Khoa
insert into user_vouchers (user_id, voucher_id, is_used)
values
  ('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555551', false),
  ('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555552', false),
  ('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555553', false),
  ('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555554', false);
