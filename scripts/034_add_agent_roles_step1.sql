-- Step 1: Add agent roles to user_role enum
-- This must be run in a separate transaction before the tables can be created

-- Add agent roles to the user_role enum
ALTER TYPE user_role ADD VALUE 'seller_agent';
ALTER TYPE user_role ADD VALUE 'buyer_agent';
