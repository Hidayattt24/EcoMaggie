-- ===========================================
-- ECO-MAGGIE DATABASE SCHEMA
-- ===========================================
-- Database: PostgreSQL (Supabase)
-- Run this AFTER 000_auth_schema.sql
-- ===========================================

-- ===========================================
-- STEP 1: CREATE ADDITIONAL ENUMS (IF NOT EXISTS)
-- ===========================================
-- Note: user_role already created in 000_auth_schema.sql

-- Order Status Enum
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Product Category Enum
DO $$ BEGIN
    CREATE TYPE product_category AS ENUM ('VEGETABLES', 'FRUITS', 'GRAINS', 'DAIRY', 'MEAT', 'ORGANIC', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Supply Status Enum
DO $$ BEGIN
    CREATE TYPE supply_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- ===========================================
-- STEP 2: CREATE TABLES
-- ===========================================
-- Note: public.users table already created in 000_auth_schema.sql

-- Farmers Table (for users with FARMER role)
CREATE TABLE IF NOT EXISTS public.farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    farm_name VARCHAR(255) NOT NULL,
    description TEXT,
    location TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_farmers_user_id ON public.farmers(user_id);


-- Addresses Table
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    street TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);


-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'kg',
    category product_category DEFAULT 'OTHER',
    images TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3, 2) DEFAULT 0,
    total_sold INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON public.products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);


-- Carts Table
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);


-- Cart Items Table
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cart_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);


-- Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    address_id UUID NOT NULL REFERENCES public.addresses(id),
    status order_status DEFAULT 'PENDING',
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    payment_method VARCHAR(50),
    paid_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);


-- Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);


-- Order Tracking Table
CREATE TABLE IF NOT EXISTS public.order_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status VARCHAR(100) NOT NULL,
    description TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_tracking_order_id ON public.order_tracking(order_id);


-- Wishlists Table
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);


-- Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);


-- Supplies Table (for farmer supply monitoring)
CREATE TABLE IF NOT EXISTS public.supplies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    status supply_status DEFAULT 'SCHEDULED',
    harvest_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supplies_farmer_id ON public.supplies(farmer_id);
CREATE INDEX IF NOT EXISTS idx_supplies_status ON public.supplies(status);


-- ===========================================
-- STEP 3: CREATE TRIGGERS FOR updated_at
-- ===========================================
-- Note: update_updated_at_column() function already created in 000_auth_schema.sql

DROP TRIGGER IF EXISTS update_farmers_updated_at ON public.farmers;
CREATE TRIGGER update_farmers_updated_at BEFORE UPDATE ON public.farmers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_addresses_updated_at ON public.addresses;
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_carts_updated_at ON public.carts;
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_supplies_updated_at ON public.supplies;
CREATE TRIGGER update_supplies_updated_at BEFORE UPDATE ON public.supplies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ===========================================
-- STEP 4: ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================
-- Note: public.users RLS already configured in 000_auth_schema.sql

-- Enable RLS on all NEW tables
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;


-- FARMERS POLICIES
DROP POLICY IF EXISTS "Anyone can view farmers" ON public.farmers;
CREATE POLICY "Anyone can view farmers" ON public.farmers
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Farmers can update own profile" ON public.farmers;
CREATE POLICY "Farmers can update own profile" ON public.farmers
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create farmer profile" ON public.farmers;
CREATE POLICY "Users can create farmer profile" ON public.farmers
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ADDRESSES POLICIES
DROP POLICY IF EXISTS "Users can view own addresses" ON public.addresses;
CREATE POLICY "Users can view own addresses" ON public.addresses
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own addresses" ON public.addresses;
CREATE POLICY "Users can create own addresses" ON public.addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own addresses" ON public.addresses;
CREATE POLICY "Users can update own addresses" ON public.addresses
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own addresses" ON public.addresses;
CREATE POLICY "Users can delete own addresses" ON public.addresses
    FOR DELETE USING (auth.uid() = user_id);


-- PRODUCTS POLICIES
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Farmers can view all own products" ON public.products;
CREATE POLICY "Farmers can view all own products" ON public.products
    FOR SELECT USING (
        farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Farmers can create products" ON public.products;
CREATE POLICY "Farmers can create products" ON public.products
    FOR INSERT WITH CHECK (
        farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Farmers can update own products" ON public.products;
CREATE POLICY "Farmers can update own products" ON public.products
    FOR UPDATE USING (
        farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Farmers can delete own products" ON public.products;
CREATE POLICY "Farmers can delete own products" ON public.products
    FOR DELETE USING (
        farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
    );


-- CARTS POLICIES
DROP POLICY IF EXISTS "Users can view own cart" ON public.carts;
CREATE POLICY "Users can view own cart" ON public.carts
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own cart" ON public.carts;
CREATE POLICY "Users can create own cart" ON public.carts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cart" ON public.carts;
CREATE POLICY "Users can update own cart" ON public.carts
    FOR UPDATE USING (auth.uid() = user_id);


-- CART ITEMS POLICIES
DROP POLICY IF EXISTS "Users can view own cart items" ON public.cart_items;
CREATE POLICY "Users can view own cart items" ON public.cart_items
    FOR SELECT USING (
        cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can add to own cart" ON public.cart_items;
CREATE POLICY "Users can add to own cart" ON public.cart_items
    FOR INSERT WITH CHECK (
        cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can update own cart items" ON public.cart_items;
CREATE POLICY "Users can update own cart items" ON public.cart_items
    FOR UPDATE USING (
        cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can remove from own cart" ON public.cart_items;
CREATE POLICY "Users can remove from own cart" ON public.cart_items
    FOR DELETE USING (
        cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid())
    );


-- ORDERS POLICIES
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
CREATE POLICY "Users can create own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers can view orders containing their products" ON public.orders;
CREATE POLICY "Farmers can view orders containing their products" ON public.orders
    FOR SELECT USING (
        id IN (
            SELECT DISTINCT oi.order_id FROM public.order_items oi
            JOIN public.products p ON oi.product_id = p.id
            JOIN public.farmers f ON p.farmer_id = f.id
            WHERE f.user_id = auth.uid()
        )
    );


-- ORDER ITEMS POLICIES
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT USING (
        order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
CREATE POLICY "Users can create order items" ON public.order_items
    FOR INSERT WITH CHECK (
        order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
    );


-- ORDER TRACKING POLICIES
DROP POLICY IF EXISTS "Users can view own order tracking" ON public.order_tracking;
CREATE POLICY "Users can view own order tracking" ON public.order_tracking
    FOR SELECT USING (
        order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
    );


-- WISHLISTS POLICIES
DROP POLICY IF EXISTS "Users can view own wishlist" ON public.wishlists;
CREATE POLICY "Users can view own wishlist" ON public.wishlists
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add to wishlist" ON public.wishlists;
CREATE POLICY "Users can add to wishlist" ON public.wishlists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove from wishlist" ON public.wishlists;
CREATE POLICY "Users can remove from wishlist" ON public.wishlists
    FOR DELETE USING (auth.uid() = user_id);


-- REVIEWS POLICIES
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
CREATE POLICY "Users can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
CREATE POLICY "Users can delete own reviews" ON public.reviews
    FOR DELETE USING (auth.uid() = user_id);


-- SUPPLIES POLICIES
DROP POLICY IF EXISTS "Farmers can view own supplies" ON public.supplies;
CREATE POLICY "Farmers can view own supplies" ON public.supplies
    FOR SELECT USING (
        farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Farmers can create supplies" ON public.supplies;
CREATE POLICY "Farmers can create supplies" ON public.supplies
    FOR INSERT WITH CHECK (
        farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Farmers can update own supplies" ON public.supplies;
CREATE POLICY "Farmers can update own supplies" ON public.supplies
    FOR UPDATE USING (
        farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Farmers can delete own supplies" ON public.supplies;
CREATE POLICY "Farmers can delete own supplies" ON public.supplies
    FOR DELETE USING (
        farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
    );


-- ===========================================
-- STEP 5: GRANT PERMISSIONS FOR NEW TABLES
-- ===========================================

GRANT SELECT ON public.farmers TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.reviews TO anon;

GRANT ALL ON public.farmers TO authenticated;
GRANT ALL ON public.addresses TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.carts TO authenticated;
GRANT ALL ON public.cart_items TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.order_items TO authenticated;
GRANT ALL ON public.order_tracking TO authenticated;
GRANT ALL ON public.wishlists TO authenticated;
GRANT ALL ON public.reviews TO authenticated;
GRANT ALL ON public.supplies TO authenticated;


-- ===========================================
-- DONE! Additional tables ready.
-- ===========================================
