-- ===========================================
-- ECO-MAGGIE PROFILE & ADDRESS OPTIMIZATION
-- ===========================================
-- Migration: 009_profile_address_optimization.sql
-- Purpose: Optimize profile and address tables for user management
-- Run this AFTER 008_product_unit_enhancement.sql
-- ===========================================


-- ===========================================
-- STEP 1: VERIFY USERS TABLE STRUCTURE
-- ===========================================
-- The users table already has all needed columns:
-- - name (full_name)
-- - email
-- - phone (phone_number)
-- - avatar (avatar_url)
-- - province, city, postal_code, full_address
-- 
-- No changes needed - schema is complete!


-- ===========================================
-- STEP 2: ENSURE ADDRESSES TABLE IS OPTIMAL
-- ===========================================
-- The addresses table from 001_initial_schema.sql has:
-- - label (Rumah, Kantor, etc) ✓
-- - recipient (receiver_name) ✓
-- - phone (phone_number) ✓
-- - street, city, province, postal_code ✓
-- - is_default (is_main) ✓
-- 
-- Just ensure indexes are in place


-- ===========================================
-- STEP 3: ADD HELPFUL INDEXES
-- ===========================================

-- Index for faster user lookups by phone
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);

-- Index for faster address queries
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON public.addresses(is_default) WHERE is_default = true;

-- Composite index for user's default address
CREATE INDEX IF NOT EXISTS idx_addresses_user_default ON public.addresses(user_id, is_default);


-- ===========================================
-- STEP 4: CREATE HELPER FUNCTIONS
-- ===========================================

-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION enforce_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        -- Set all other addresses for this user to non-default
        UPDATE public.addresses
        SET is_default = false
        WHERE user_id = NEW.user_id
        AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS ensure_single_default_address ON public.addresses;

-- Create trigger
CREATE TRIGGER ensure_single_default_address
BEFORE INSERT OR UPDATE ON public.addresses
FOR EACH ROW
WHEN (NEW.is_default = true)
EXECUTE FUNCTION enforce_single_default_address();


-- ===========================================
-- STEP 5: CREATE PROFILE VIEW FOR EASY ACCESS
-- ===========================================

-- Drop view if exists
DROP VIEW IF EXISTS public.user_profiles;

-- Create view for user profiles with formatted data
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
    u.id,
    u.email,
    u.name as full_name,
    u.phone as phone_number,
    u.avatar as avatar_url,
    u.role,
    u.province,
    u.city,
    u.postal_code,
    u.full_address,
    u.business_name,
    u.user_type,
    u.email_verified,
    u.created_at,
    u.updated_at,
    -- Format phone for display (e.g., 081234567890 -> +62 812-3456-7890)
    CASE 
        WHEN u.phone LIKE '08%' THEN '+62 ' || SUBSTRING(u.phone FROM 2 FOR 3) || '-' || SUBSTRING(u.phone FROM 5 FOR 4) || '-' || SUBSTRING(u.phone FROM 9)
        ELSE u.phone
    END as phone_formatted,
    -- Check if user has verified email
    CASE 
        WHEN u.email_verified IS NOT NULL THEN true
        ELSE false
    END as is_email_verified
FROM public.users u;


-- ===========================================
-- STEP 6: CREATE ADDRESS SUMMARY VIEW
-- ===========================================

-- Drop view if exists
DROP VIEW IF EXISTS public.user_address_summary;

-- Create view for address summary
CREATE OR REPLACE VIEW public.user_address_summary AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    COUNT(a.id) as total_addresses,
    MAX(CASE WHEN a.is_default = true THEN a.id END) as default_address_id,
    MAX(CASE WHEN a.is_default = true THEN a.label END) as default_address_label,
    MAX(CASE WHEN a.is_default = true THEN a.recipient END) as default_recipient,
    MAX(CASE WHEN a.is_default = true THEN a.phone END) as default_phone,
    MAX(CASE WHEN a.is_default = true THEN CONCAT(a.street, ', ', a.city, ', ', a.province, ' ', a.postal_code) END) as default_full_address
FROM public.users u
LEFT JOIN public.addresses a ON u.id = a.user_id
GROUP BY u.id, u.name;


-- ===========================================
-- STEP 7: ADD VALIDATION CONSTRAINTS
-- ===========================================

-- Ensure phone number format (Indonesian)
DO $$ BEGIN
    ALTER TABLE public.users 
    DROP CONSTRAINT IF EXISTS check_phone_format;
    
    ALTER TABLE public.users 
    ADD CONSTRAINT check_phone_format 
    CHECK (phone IS NULL OR phone ~ '^(08|62|\\+62)[0-9]{8,13}$');
EXCEPTION
    WHEN others THEN null;
END $$;

-- Ensure address phone format
DO $$ BEGIN
    ALTER TABLE public.addresses 
    DROP CONSTRAINT IF EXISTS check_address_phone_format;
    
    ALTER TABLE public.addresses 
    ADD CONSTRAINT check_address_phone_format 
    CHECK (phone ~ '^(08|62|\\+62)[0-9]{8,13}$');
EXCEPTION
    WHEN others THEN null;
END $$;

-- Ensure postal code is 5 digits
DO $$ BEGIN
    ALTER TABLE public.addresses 
    DROP CONSTRAINT IF EXISTS check_postal_code_format;
    
    ALTER TABLE public.addresses 
    ADD CONSTRAINT check_postal_code_format 
    CHECK (postal_code ~ '^[0-9]{5}$');
EXCEPTION
    WHEN others THEN null;
END $$;


-- ===========================================
-- STEP 8: UPDATE RLS POLICIES (if needed)
-- ===========================================
-- Policies already exist from 001_initial_schema.sql
-- Just ensure they're correct

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);


-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================
-- Run these to verify setup:

-- Check user profile structure
-- SELECT * FROM public.user_profiles LIMIT 1;

-- Check address summary
-- SELECT * FROM public.user_address_summary LIMIT 5;

-- Check indexes
-- SELECT tablename, indexname FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('users', 'addresses')
-- ORDER BY tablename, indexname;


-- ===========================================
-- DONE!
-- ===========================================
-- Schema is now optimized for:
-- 1. User profile management (Navbar, Settings)
-- 2. Address CRUD operations
-- 3. Single default address enforcement
-- 4. Phone number formatting and validation
-- ===========================================
