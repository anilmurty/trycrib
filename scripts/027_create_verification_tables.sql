-- Create verification tables for user onboarding verification
-- This script creates tables to store verification documents and status

-- Verification documents table
CREATE TABLE IF NOT EXISTS verification_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_role TEXT NOT NULL CHECK (user_role IN ('buyer', 'seller')),
    document_type TEXT NOT NULL CHECK (document_type IN ('property_tax_statement', 'property_info_screenshot', 'loan_preapproval')),
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'expired')),
    rejection_reason TEXT,
    verified_by TEXT REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seller verification details
CREATE TABLE IF NOT EXISTS seller_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    verification_document_id UUID REFERENCES verification_documents(id) ON DELETE CASCADE,
    property_address TEXT NOT NULL,
    property_owner_name TEXT NOT NULL,
    property_tax_year INTEGER,
    property_value DECIMAL(15,2),
    clark_county_pin TEXT, -- Property Identification Number
    verification_method TEXT NOT NULL CHECK (verification_method IN ('tax_statement', 'gis_screenshot', 'gis_api')),
    gis_api_data JSONB, -- Store API response data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buyer verification details
CREATE TABLE IF NOT EXISTS buyer_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    verification_document_id UUID REFERENCES verification_documents(id) ON DELETE CASCADE,
    lender_name TEXT NOT NULL,
    preapproval_amount DECIMAL(15,2) NOT NULL,
    preapproval_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    property_type TEXT, -- e.g., "Single Family"
    interest_rate DECIMAL(5,4),
    loan_type TEXT, -- e.g., "Conventional/Non Agency 30 YR Fixed"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User verification status summary
CREATE TABLE IF NOT EXISTS user_verification_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_role TEXT NOT NULL CHECK (user_role IN ('buyer', 'seller')),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_completed_at TIMESTAMP WITH TIME ZONE,
    last_verification_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, user_role)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_verification_documents_user_id ON verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_status ON verification_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_seller_verifications_user_id ON seller_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_buyer_verifications_user_id ON buyer_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verification_status_user_id ON user_verification_status(user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_verification_documents_updated_at 
    BEFORE UPDATE ON verification_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seller_verifications_updated_at 
    BEFORE UPDATE ON seller_verifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buyer_verifications_updated_at 
    BEFORE UPDATE ON buyer_verifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_verification_status_updated_at 
    BEFORE UPDATE ON user_verification_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verification_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own verification documents
CREATE POLICY "Users can view own verification documents" ON verification_documents
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own verification documents" ON verification_documents
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own verification documents" ON verification_documents
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Similar policies for other tables
CREATE POLICY "Users can view own seller verifications" ON seller_verifications
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own seller verifications" ON seller_verifications
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own seller verifications" ON seller_verifications
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own buyer verifications" ON buyer_verifications
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own buyer verifications" ON buyer_verifications
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own buyer verifications" ON buyer_verifications
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own verification status" ON user_verification_status
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own verification status" ON user_verification_status
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own verification status" ON user_verification_status
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Admin policies (for verification approval/rejection)
CREATE POLICY "Admins can view all verification documents" ON verification_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid()::text 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can view all seller verifications" ON seller_verifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid()::text 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can view all buyer verifications" ON buyer_verifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid()::text 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can view all verification status" ON user_verification_status
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid()::text 
            AND profiles.role = 'admin'
        )
    );
