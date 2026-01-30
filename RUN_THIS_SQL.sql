-- ===========================================
-- COPY & PASTE SQL INI KE SUPABASE SQL EDITOR
-- ===========================================
-- Path: Supabase Dashboard → SQL Editor → New Query
-- Paste code di bawah ini, lalu klik RUN
-- ===========================================

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Farmers can view addresses for supply monitoring" ON public.addresses;

-- Create new policy: Farmers can view addresses that are referenced in user_supplies
CREATE POLICY "Farmers can view addresses for supply monitoring" 
ON public.addresses
FOR SELECT 
USING (
    -- Allow if user is a farmer
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'FARMER'
    )
);

-- Verify policy created successfully
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'addresses'
AND policyname = 'Farmers can view addresses for supply monitoring';

-- Expected result: Should show 1 row with the new policy
