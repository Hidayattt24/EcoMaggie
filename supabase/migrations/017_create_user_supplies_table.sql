-- ===========================================
-- USER SUPPLIES TABLE - SUPPLY CONNECT
-- ===========================================
-- Tabel untuk menyimpan data supply sampah organik dari user
-- Berbeda dengan tabel 'supplies' yang untuk farmer monitoring
-- ===========================================

-- ===========================================
-- STEP 1: CREATE ENUM FOR USER SUPPLY STATUS
-- ===========================================

DO $$ BEGIN
    CREATE TYPE user_supply_status AS ENUM (
        'PENDING',      -- Menunggu konfirmasi
        'SCHEDULED',    -- Dijadwalkan untuk pickup
        'ON_THE_WAY',   -- Kurir dalam perjalanan
        'PICKED_UP',    -- Sudah diambil kurir
        'COMPLETED',    -- Selesai diproses
        'CANCELLED'     -- Dibatalkan
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- ===========================================
-- STEP 2: CREATE USER_SUPPLIES TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS public.user_supplies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User Information
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    supply_number VARCHAR(50) UNIQUE NOT NULL, -- Format: SUP-XXXXXX
    
    -- Waste Information
    waste_type VARCHAR(50) NOT NULL, -- sisa_makanan, sayuran_buah, sisa_dapur, campuran
    estimated_weight VARCHAR(20) NOT NULL, -- 1, 3, 5, 10, 15 (kg range)
    
    -- Media Files (REQUIRED - at least one must be provided)
    photo_url TEXT, -- URL foto sampah
    video_url TEXT, -- URL video sampah (optional)
    media_type VARCHAR(20) DEFAULT 'photo', -- 'photo', 'video', or 'both'
    video_duration INTEGER, -- Duration in seconds (for video)
    video_size_mb DECIMAL(10, 2), -- Video file size in MB
    
    -- Pickup Information
    pickup_address TEXT NOT NULL, -- Alamat lengkap pickup
    pickup_address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL, -- Reference ke addresses table (optional)
    pickup_date DATE NOT NULL, -- Tanggal pickup
    pickup_time_slot VARCHAR(20) NOT NULL, -- pagi, siang, sore
    pickup_time_range VARCHAR(50), -- "08:00 - 10:00", "12:00 - 14:00", "16:00 - 18:00"
    
    -- Additional Information
    notes TEXT, -- Catatan untuk kurir (optional)
    courier_name VARCHAR(100), -- Nama kurir yang mengambil
    courier_phone VARCHAR(20), -- Nomor kurir
    
    -- Status & Tracking
    status user_supply_status DEFAULT 'PENDING',
    status_history JSONB DEFAULT '[]'::jsonb, -- Array of {status, timestamp, note}
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    picked_up_at TIMESTAMP WITH TIME ZONE, -- Waktu actual pickup
    completed_at TIMESTAMP WITH TIME ZONE -- Waktu selesai diproses
);


-- ===========================================
-- STEP 3: CREATE INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_user_supplies_user_id ON public.user_supplies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_supplies_status ON public.user_supplies(status);
CREATE INDEX IF NOT EXISTS idx_user_supplies_pickup_date ON public.user_supplies(pickup_date);
CREATE INDEX IF NOT EXISTS idx_user_supplies_supply_number ON public.user_supplies(supply_number);
CREATE INDEX IF NOT EXISTS idx_user_supplies_created_at ON public.user_supplies(created_at DESC);


-- ===========================================
-- STEP 4: CREATE TRIGGER FOR updated_at
-- ===========================================

DROP TRIGGER IF EXISTS update_user_supplies_updated_at ON public.user_supplies;
CREATE TRIGGER update_user_supplies_updated_at 
BEFORE UPDATE ON public.user_supplies
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();


-- ===========================================
-- STEP 5: CREATE FUNCTION TO GENERATE SUPPLY NUMBER
-- ===========================================

CREATE OR REPLACE FUNCTION generate_supply_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    random_string TEXT;
BEGIN
    -- Generate random 6 character alphanumeric string
    random_string := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    new_number := 'SUP-' || random_string;
    
    -- Check if exists, regenerate if needed
    WHILE EXISTS (SELECT 1 FROM public.user_supplies WHERE supply_number = new_number) LOOP
        random_string := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
        new_number := 'SUP-' || random_string;
    END LOOP;
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;


-- ===========================================
-- STEP 6: CREATE TRIGGER TO AUTO-GENERATE SUPPLY NUMBER
-- ===========================================

CREATE OR REPLACE FUNCTION set_supply_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.supply_number IS NULL OR NEW.supply_number = '' THEN
        NEW.supply_number := generate_supply_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_supply_number ON public.user_supplies;
CREATE TRIGGER trigger_set_supply_number
BEFORE INSERT ON public.user_supplies
FOR EACH ROW
EXECUTE FUNCTION set_supply_number();


-- ===========================================
-- STEP 7: CREATE FUNCTION TO UPDATE STATUS HISTORY
-- ===========================================

CREATE OR REPLACE FUNCTION update_supply_status_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if status changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        NEW.status_history := NEW.status_history || jsonb_build_object(
            'status', NEW.status,
            'timestamp', NOW(),
            'note', COALESCE(NEW.notes, '')
        );
        
        -- Update timestamp fields based on status
        IF NEW.status = 'PICKED_UP' AND NEW.picked_up_at IS NULL THEN
            NEW.picked_up_at := NOW();
        END IF;
        
        IF NEW.status = 'COMPLETED' AND NEW.completed_at IS NULL THEN
            NEW.completed_at := NOW();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_supply_status_history ON public.user_supplies;
CREATE TRIGGER trigger_update_supply_status_history
BEFORE UPDATE ON public.user_supplies
FOR EACH ROW
EXECUTE FUNCTION update_supply_status_history();


-- ===========================================
-- STEP 8: ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================

ALTER TABLE public.user_supplies ENABLE ROW LEVEL SECURITY;

-- Users can view their own supplies
DROP POLICY IF EXISTS "Users can view own supplies" ON public.user_supplies;
CREATE POLICY "Users can view own supplies" 
ON public.user_supplies
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own supplies
DROP POLICY IF EXISTS "Users can create own supplies" ON public.user_supplies;
CREATE POLICY "Users can create own supplies" 
ON public.user_supplies
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own supplies (only if status is PENDING or SCHEDULED)
DROP POLICY IF EXISTS "Users can update own supplies" ON public.user_supplies;
CREATE POLICY "Users can update own supplies" 
ON public.user_supplies
FOR UPDATE 
USING (
    auth.uid() = user_id 
    AND status IN ('PENDING', 'SCHEDULED')
);

-- Users can delete their own supplies (only if status is PENDING)
DROP POLICY IF EXISTS "Users can delete own supplies" ON public.user_supplies;
CREATE POLICY "Users can delete own supplies" 
ON public.user_supplies
FOR DELETE 
USING (
    auth.uid() = user_id 
    AND status = 'PENDING'
);

-- Admins can view all supplies
DROP POLICY IF EXISTS "Admins can view all supplies" ON public.user_supplies;
CREATE POLICY "Admins can view all supplies" 
ON public.user_supplies
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'ADMIN'
    )
);

-- Admins can update all supplies
DROP POLICY IF EXISTS "Admins can update all supplies" ON public.user_supplies;
CREATE POLICY "Admins can update all supplies" 
ON public.user_supplies
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'ADMIN'
    )
);


-- ===========================================
-- STEP 9: GRANT PERMISSIONS
-- ===========================================

GRANT ALL ON public.user_supplies TO authenticated;
GRANT SELECT ON public.user_supplies TO anon;


-- ===========================================
-- STEP 10: CREATE VIEW FOR SUPPLY STATISTICS
-- ===========================================

CREATE OR REPLACE VIEW public.user_supply_stats AS
SELECT 
    user_id,
    COUNT(*) as total_supplies,
    COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_supplies,
    COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled_supplies,
    COUNT(*) FILTER (WHERE status IN ('PENDING', 'SCHEDULED', 'ON_THE_WAY')) as active_supplies,
    SUM(
        CASE 
            WHEN estimated_weight = '1' THEN 1
            WHEN estimated_weight = '3' THEN 3
            WHEN estimated_weight = '5' THEN 5
            WHEN estimated_weight = '10' THEN 10
            WHEN estimated_weight = '15' THEN 15
            ELSE 0
        END
    ) as total_estimated_weight_kg,
    MIN(created_at) as first_supply_date,
    MAX(created_at) as last_supply_date
FROM public.user_supplies
GROUP BY user_id;

GRANT SELECT ON public.user_supply_stats TO authenticated;


-- ===========================================
-- STEP 11: VERIFICATION QUERY
-- ===========================================

SELECT 
    'user_supplies table' as info,
    COUNT(*) as total_columns
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_supplies';

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
AND tablename = 'user_supplies';

-- Check policies
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'user_supplies';


-- ===========================================
-- DONE!
-- ===========================================
/*
SUMMARY:
✅ Created user_supplies table with all required fields
✅ Created enum for supply status
✅ Created indexes for performance
✅ Auto-generate supply number (SUP-XXXXXX)
✅ Auto-update status history on status change
✅ RLS policies for security
✅ View for statistics

FIELD MAPPING:
- waste_type: Jenis Sampah Organik (sisa_makanan, sayuran_buah, sisa_dapur, campuran)
- estimated_weight: Perkiraan Berat Sampah (1, 3, 5, 10, 15 kg)
- photo_url: Foto Sampah (optional)
- pickup_address: Alamat Pickup (text lengkap)
- pickup_address_id: Reference ke addresses table (optional)
- pickup_date: Tanggal Pickup
- pickup_time_slot: Waktu Pickup (pagi, siang, sore)
- notes: Catatan untuk Kurir (optional)
- status: Status supply (PENDING, SCHEDULED, ON_THE_WAY, PICKED_UP, COMPLETED, CANCELLED)

NEXT STEPS:
1. Run this migration in Supabase SQL Editor
2. Create server actions in src/lib/api/supply.actions.ts
3. Update supply/input/page.tsx to use the actions
4. Test the flow end-to-end
*/
