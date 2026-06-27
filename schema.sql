-- ============================================================
-- LOOPEE — Supabase Schema
-- Paste toàn bộ file này vào Supabase SQL Editor rồi bấm Run
-- ============================================================

-- USERS
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  avatar_url text,
  total_orders int default 0,
  points int default 0,
  plastic_reduction_pct int default 0,
  co2_offset_kg numeric default 0,
  created_at timestamptz default now()
);

-- MILESTONES definition
create table milestones (
  id serial primary key,
  orders_required int not null,
  points_reward int not null,
  label text
);

-- USER MILESTONES (tracking claimed)
create table user_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  milestone_id int references milestones(id),
  reached_at timestamptz default now(),
  claimed_at timestamptz,
  is_claimed boolean default false,
  unique(user_id, milestone_id)
);

-- CATEGORIES
create table categories (
  id serial primary key,
  name text,
  icon_url text
);

-- RESTAURANTS
create table restaurants (
  id uuid primary key default gen_random_uuid(),
  name text,
  address text,
  distance_km numeric,
  rating numeric,
  rating_count int,
  delivery_time_min int,
  image_url text,
  category_id int references categories(id),
  is_eco_partner boolean default true,
  is_editors_pick boolean default false
);

-- ORDERS
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique,
  user_id uuid references users(id),
  restaurant_id uuid references restaurants(id),
  restaurant_name text,
  status text default 'preparing',
  -- status values: preparing | out_for_delivery | delivered | returned
  eco_box_count int default 1,
  return_deadline timestamptz,
  returned_at timestamptz,
  reward_pct int default 100,
  created_at timestamptz default now()
);

-- RETURN TOKENS (QR code cho từng đơn)
create table return_tokens (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  user_id uuid references users(id),
  token_code text unique,
  is_used boolean default false,
  used_at timestamptz,
  points_earned int
);

-- GREEN STATIONS
create table green_stations (
  id uuid primary key default gen_random_uuid(),
  name text,
  address text,
  district text,
  lat numeric,
  lng numeric,
  capacity int default 20,
  current_load int default 0,
  status text default 'available'
  -- status: available | full
);

-- VOUCHERS
create table vouchers (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  category text,
  -- category: loopee_dine_in | chtl_eco_partner
  discount_type text,
  -- discount_type: fixed | percentage | free_delivery
  discount_value numeric,
  min_order_value numeric,
  applicable_to text,
  expires_at date,
  icon_type text default 'restaurant'
  -- icon_type: restaurant | store
);

-- USER VOUCHERS
create table user_vouchers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  voucher_id uuid references vouchers(id),
  is_used boolean default false,
  used_at timestamptz,
  acquired_at timestamptz default now()
);
