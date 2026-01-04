-- ===========================================
-- ADD FARMER POLICIES TO USER_SUPPLIES TABLE
-- ===========================================
-- Allow farmers to view and manage all supply orders
-- ===========================================

-- Farmers can view all supplies
DROP POLICY IF EXISTS "Farmers can view all supplies" ON public.user_supplies;
CREATE POLICY "Farmers can view all supplies" 
ON public.user_supplies
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'FARMER'
    )
);

-- Farmers can update all supplies (to change status, assign courier, etc)
DROP POLICY IF EXISTS "Farmers can update all supplies" ON public.user_supplies;
CREATE POLICY "Farmers can update all supplies" 
ON public.user_supplies
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'FARMER'
    )
);

-- ===========================================
-- VERIFICATION
-- ===========================================

-- Check all policies for user_supplies table
SELECT 
    policyname,
    cmd,
    roles,
    qual
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'user_supplies'
ORDER BY policyname;

-- ===========================================
-- DONE!
-- ===========================================
/*
SUMMARY:
✅ Added policy for farmers to view all supplies
✅ Added policy for farmers to update all supplies
✅ Farmers can now manage supply orders from users

NEXT STEPS:
1. Run this migration in Supabase SQL Editor
2. Test farmer access to /farmer/orders
3. Verify farmers can see and update supply orders
*/
