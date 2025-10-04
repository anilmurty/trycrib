-- Add stripe_session_id column to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session_id ON bookings(stripe_session_id);
