-- ===========================================
-- ECO-MAGGIE AUTH SCHEMA (MINIMAL)
-- ===========================================
-- Jalankan ini PERTAMA di Supabase SQL Editor
-- Untuk tabel yang dibutuhkan auth (register, login, otp)
-- ===========================================

-- STEP 1: Create user_role enum
CREATE TYPE user_role AS ENUM ('USER', 'FARMER', 'ADMIN');


-- STEP 2: Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(20),
    avatar TEXT,
    role user_role DEFAULT 'USER',
    
    -- Location data from register form
    province VARCHAR(100),
    city VARCHAR(100),
    postal_code VARCHAR(10),
    full_address TEXT,
    
    -- Business info (for farmers)
    business_name VARCHAR(255),
    user_type VARCHAR(50), -- jenisPengguna from register
    
    email_verified TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);


-- STEP 3: Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- STEP 4: Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id, 
        email, 
        name, 
        phone, 
        role,
        province,
        city,
        postal_code,
        full_address,
        business_name,
        user_type
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'namaLengkap'),
        NEW.raw_user_meta_data->>'phone',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'USER'),
        NEW.raw_user_meta_data->>'provinsi',
        NEW.raw_user_meta_data->>'kabupatenKota',
        NEW.raw_user_meta_data->>'kodePos',
        NEW.raw_user_meta_data->>'alamatLengkap',
        NEW.raw_user_meta_data->>'namaUsaha',
        NEW.raw_user_meta_data->>'jenisPengguna'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- STEP 5: Sync user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET
        email = NEW.email,
        name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'namaLengkap', public.users.name),
        phone = COALESCE(NEW.raw_user_meta_data->>'phone', public.users.phone),
        email_verified = NEW.email_confirmed_at,
        updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();


-- STEP 6: Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Anyone can view basic user info (for public profiles)
CREATE POLICY "Public can view users" ON public.users
    FOR SELECT USING (true);


-- STEP 7: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.users TO anon;
GRANT ALL ON public.users TO authenticated;


-- ===========================================
-- DONE! Auth tables ready.
-- Next: Configure Supabase Auth settings
-- ===========================================
