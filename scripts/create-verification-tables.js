const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ycmlwjirkmxgthyhurwc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbWx3amlya214Z3RoeWh1cndjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU0Njk1MCwiZXhwIjoyMDc1MTIyOTUwfQ.NuiSvz9P7UOY09ZUfZcH87UUKbOUQyJE_yB-YxoL5zU';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createTables() {
  try {
    console.log('Creating verification tables...');
    
    // Create verification_documents table
    const { error: docsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS verification_documents (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_role TEXT NOT NULL CHECK (user_role IN ('buyer', 'seller')),
          document_type TEXT NOT NULL CHECK (document_type IN ('property_tax_statement', 'property_info_screenshot', 'loan_preapproval')),
          file_url TEXT NOT NULL,
          file_name TEXT NOT NULL,
          file_size INTEGER,
          mime_type TEXT,
          verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'expired')),
          rejection_reason TEXT,
          verified_by TEXT,
          verified_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (docsError) {
      console.error('Error creating verification_documents:', docsError);
      return;
    }
    
    // Create seller_verifications table
    const { error: sellerError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS seller_verifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          verification_document_id UUID,
          property_address TEXT NOT NULL,
          property_owner_name TEXT NOT NULL,
          property_tax_year INTEGER,
          property_value DECIMAL(15,2),
          clark_county_pin TEXT,
          verification_method TEXT NOT NULL CHECK (verification_method IN ('tax_statement', 'gis_screenshot', 'gis_api')),
          gis_api_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (sellerError) {
      console.error('Error creating seller_verifications:', sellerError);
      return;
    }
    
    // Create buyer_verifications table
    const { error: buyerError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS buyer_verifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          verification_document_id UUID,
          lender_name TEXT NOT NULL,
          preapproval_amount DECIMAL(15,2) NOT NULL,
          preapproval_date DATE NOT NULL,
          expiration_date DATE NOT NULL,
          property_type TEXT,
          interest_rate DECIMAL(5,4),
          loan_type TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (buyerError) {
      console.error('Error creating buyer_verifications:', buyerError);
      return;
    }
    
    // Create user_verification_status table
    const { error: statusError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_verification_status (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_role TEXT NOT NULL CHECK (user_role IN ('buyer', 'seller')),
          is_verified BOOLEAN DEFAULT FALSE,
          verification_completed_at TIMESTAMP WITH TIME ZONE,
          last_verification_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          verification_notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, user_role)
        );
      `
    });
    
    if (statusError) {
      console.error('Error creating user_verification_status:', statusError);
      return;
    }
    
    console.log('All verification tables created successfully!');
    
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

createTables();
