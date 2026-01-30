-- ===========================================
-- ADD FARMER ACCESS TO ADDRESSES
-- ===========================================
-- Farmer perlu akses ke addresses untuk melihat
-- nama penerima (recipient) di supply monitoring
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

-- Verify policy
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'addresses'
AND policyname = 'Farmers can view addresses for supply monitoring';
