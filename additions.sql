-- ============================================================
-- LOOPEE — Additions: Menu, Cart, Group Order
-- Paste vào Supabase SQL Editor → Run
-- ============================================================

-- MENU ITEMS
create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id),
  name text,
  description text,
  price int,
  image_url text,
  category text,
  is_available boolean default true
);

-- CART ITEMS (server-side, optional)
create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  menu_item_id uuid references menu_items(id),
  restaurant_id uuid references restaurants(id),
  quantity int default 1,
  eco_box boolean default true,
  created_at timestamptz default now()
);

-- GROUP ORDERS
create table if not exists group_orders (
  id uuid primary key default gen_random_uuid(),
  leader_id uuid references users(id),
  restaurant_id uuid references restaurants(id),
  invite_code text unique default upper(substr(md5(random()::text), 1, 6)),
  status text default 'open',
  expires_at timestamptz default now() + interval '30 minutes',
  created_at timestamptz default now()
);

-- GROUP ORDER MEMBERS
create table if not exists group_order_members (
  id uuid primary key default gen_random_uuid(),
  group_order_id uuid references group_orders(id),
  user_id uuid references users(id),
  nickname text,
  joined_at timestamptz default now()
);

-- Enable Realtime for live updates
alter publication supabase_realtime add table return_tokens;
alter publication supabase_realtime add table group_order_members;
alter publication supabase_realtime add table group_orders;

-- ============================================================
-- SEED: Menu items
-- ============================================================

insert into menu_items (restaurant_id, name, description, price, category, is_available) values
  ('22222222-2222-2222-2222-222222222221', 'Phở Cuốn Tôm Thịt', 'Phở tươi cuốn tôm và thịt heo, chấm nước mắm đặc biệt', 65000, 'Phở Cuốn', true),
  ('22222222-2222-2222-2222-222222222221', 'Phở Cuốn Bò', 'Phở tươi cuốn thịt bò tái, rau thơm tươi', 70000, 'Phở Cuốn', true),
  ('22222222-2222-2222-2222-222222222221', 'Chả Giò', 'Chả giò chiên giòn, nhân thịt và rau củ', 45000, 'Khai Vị', true),
  ('22222222-2222-2222-2222-222222222221', 'Nước Chấm Đặc Biệt', 'Nước chấm chua ngọt đặc biệt của nhà', 10000, 'Thêm', true),
  ('22222222-2222-2222-2222-222222222222', 'Bún Riêu Cua', 'Bún riêu cua đồng truyền thống Hà Nội', 60000, 'Bún Riêu', true),
  ('22222222-2222-2222-2222-222222222222', 'Bún Riêu Đặc Biệt', 'Thêm chả, tiết, đậu hũ chiên', 75000, 'Bún Riêu', true),
  ('22222222-2222-2222-2222-222222222222', 'Rau Muống Xào Tỏi', 'Rau xanh xào tỏi thơm', 35000, 'Thêm', true),
  ('22222222-2222-2222-2222-222222222223', 'Cơm Tấm Sườn Bì', 'Cơm tấm với sườn nướng than hoa và bì', 55000, 'Cơm Tấm', true),
  ('22222222-2222-2222-2222-222222222223', 'Cơm Tấm Đặc Biệt', 'Sườn + bì + chả trứng hấp', 70000, 'Cơm Tấm', true),
  ('22222222-2222-2222-2222-222222222223', 'Canh Chua Cá', 'Canh chua cá lóc nấu me', 40000, 'Thêm', true);
