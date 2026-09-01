-- ==============================================================================
-- ZEHRA STUDIO / REETWEAR E-COMMERCE DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Run this SQL in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create PRODUCTS Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  compare_at_price NUMERIC,
  unstitched_price NUMERIC,
  package_includes TEXT DEFAULT '3PC (Shirt, Shalwar, Dupatta)',
  colors TEXT[] DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'Luxury Pret',
  fabric TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  sizes TEXT[] DEFAULT '{"XS", "S", "M", "L", "XL", "Custom"}',
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_top_sale BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely add columns if table already existed without them
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unstitched_price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS package_includes TEXT DEFAULT '3PC (Shirt, Shalwar, Dupatta)';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_top_sale BOOLEAN DEFAULT false;

-- Index for high-speed search and filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);


-- 2. Create ORDERS Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT DEFAULT '',
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'bank_transfer')),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for orders query by status and creation date
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(customer_phone);


-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;


-- 4. Set RLS Policies for PRODUCTS
-- Drop existing policies if any to avoid duplication
DROP POLICY IF EXISTS "Allow public read access on products" ON public.products;
DROP POLICY IF EXISTS "Allow all operations for anon on products" ON public.products;

-- Allow everyone (customers & visitors) to read products
CREATE POLICY "Allow public read access on products"
  ON public.products FOR SELECT
  USING (true);

-- Allow Admin / Client to insert, update and delete products
CREATE POLICY "Allow all operations for anon on products"
  ON public.products FOR ALL
  USING (true)
  WITH CHECK (true);


-- 5. Set RLS Policies for ORDERS
-- Drop existing policies if any to avoid duplication
DROP POLICY IF EXISTS "Allow public to insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow select on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow update on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow delete on orders" ON public.orders;

-- Allow customers to submit orders from checkout
CREATE POLICY "Allow public to insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Allow reading orders (for admin dashboard and customer confirmation)
CREATE POLICY "Allow select on orders"
  ON public.orders FOR SELECT
  USING (true);

-- Allow updating orders (for admin status changes)
CREATE POLICY "Allow update on orders"
  ON public.orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow deleting orders (for admin cleanup)
CREATE POLICY "Allow delete on orders"
  ON public.orders FOR DELETE
  USING (true);

-- ==============================================================================
-- Schema setup complete! You are ready to seed products and receive live orders.
-- ==============================================================================
