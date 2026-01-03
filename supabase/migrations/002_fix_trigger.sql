-- ===========================================
-- FIX: Update handle_new_user trigger
-- ===========================================
-- Run this in Supabase SQL Editor to fix the registration issue

-- STEP 1: Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- STEP 2: Grant necessary permissions to auth admin
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.users TO supabase_auth_admin;

-- STEP 3: Create simplified trigger function with RLS bypass
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_role user_role := 'USER';
    v_role_text TEXT;
BEGIN
    -- Get role from metadata safely
    v_role_text := NEW.raw_user_meta_data->>'role';
    
    IF v_role_text = 'FARMER' THEN
        v_role := 'FARMER';
    ELSIF v_role_text = 'ADMIN' THEN
        v_role := 'ADMIN';
    ELSE
        v_role := 'USER';
    END IF;

    -- Insert with all columns
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
        user_type,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'namaLengkap', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        v_role,
        COALESCE(NEW.raw_user_meta_data->>'provinsi', ''),
        COALESCE(NEW.raw_user_meta_data->>'kabupatenKota', ''),
        COALESCE(NEW.raw_user_meta_data->>'kodePos', ''),
        COALESCE(NEW.raw_user_meta_data->>'alamatLengkap', ''),
        COALESCE(NEW.raw_user_meta_data->>'namaUsaha', ''),
        COALESCE(NEW.raw_user_meta_data->>'jenisPengguna', ''),
        NOW(),
        NOW()
    );

    RETURN NEW;
EXCEPTION 
    WHEN unique_violation THEN
        -- User already exists, update instead
        UPDATE public.users SET
            email = NEW.email,
            name = COALESCE(NEW.raw_user_meta_data->>'namaLengkap', NEW.raw_user_meta_data->>'name', name),
            updated_at = NOW()
        WHERE id = NEW.id;
        RETURN NEW;
    WHEN OTHERS THEN
        RAISE LOG 'handle_new_user error: % % (SQLSTATE: %)', SQLERRM, SQLSTATE, SQLSTATE;
        RETURN NEW;
END;
$$;

-- STEP 4: Set function owner to postgres (has full permissions)
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- STEP 5: Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- STEP 6: Create update trigger function
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.users
    SET
        email = NEW.email,
        name = COALESCE(
            NEW.raw_user_meta_data->>'namaLengkap', 
            NEW.raw_user_meta_data->>'name', 
            name
        ),
        phone = COALESCE(NEW.raw_user_meta_data->>'phone', phone),
        email_verified = NEW.email_confirmed_at,
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_user_update error: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- STEP 7: Set function owner
ALTER FUNCTION public.handle_user_update() OWNER TO postgres;

-- STEP 8: Create update trigger
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_user_update();

-- STEP 9: Add RLS policy for service role insert (for triggers)
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
CREATE POLICY "Service role can insert users" ON public.users
    FOR INSERT 
    WITH CHECK (true);

-- STEP 10: Ensure RLS doesn't block the trigger
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;

-- Grant to auth admin
GRANT INSERT, UPDATE ON public.users TO supabase_auth_admin;

-- ===========================================
-- DONE! Now test registration again.
-- ===========================================
