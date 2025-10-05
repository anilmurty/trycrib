-- Create property_imports table if it doesn't exist
-- This table tracks all property feed imports

CREATE TABLE IF NOT EXISTS public.property_imports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  import_type TEXT NOT NULL, -- 'json', 'csv', etc.
  source_file TEXT, -- Original filename
  properties_processed INTEGER DEFAULT 0,
  properties_created INTEGER DEFAULT 0,
  properties_updated INTEGER DEFAULT 0,
  properties_errors INTEGER DEFAULT 0,
  import_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'completed_with_errors'
  error_details JSONB, -- Store error information
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_imports_admin_id ON public.property_imports(admin_id);
CREATE INDEX IF NOT EXISTS idx_property_imports_import_type ON public.property_imports(import_type);
CREATE INDEX IF NOT EXISTS idx_property_imports_created_at ON public.property_imports(created_at);
CREATE INDEX IF NOT EXISTS idx_property_imports_import_status ON public.property_imports(import_status);

-- Enable RLS
ALTER TABLE public.property_imports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Admins can view property imports" ON public.property_imports;
CREATE POLICY "Admins can view property imports"
  ON public.property_imports FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert property imports" ON public.property_imports;
CREATE POLICY "Admins can insert property imports"
  ON public.property_imports FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update property imports" ON public.property_imports;
CREATE POLICY "Admins can update property imports"
  ON public.property_imports FOR UPDATE
  USING (true);
