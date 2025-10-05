export type UserRole = "buyer" | "seller" | "admin" | "superadmin"
export type VerificationStatus = "pending" | "approved" | "rejected"
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  verification_status: VerificationStatus
  created_at: string
  updated_at: string
}

export interface BuyerProfile {
  id: string
  pre_approval_letter_url: string | null
  max_budget: number | null
  preferred_locations: string[] | null
  created_at: string
  updated_at: string
}

export interface SellerProfile {
  id: string
  agent_name: string | null
  agent_email: string | null
  agent_phone: string | null
  agent_commission_percent: number
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  seller_id: string | null
  title: string
  description: string | null
  address: string
  city: string
  state: string
  zip_code: string
  price_per_night: number
  bedrooms: number | null
  bathrooms: number | null
  square_feet: number | null
  listing_price: number | null
  zillow_url: string | null
  property_tax_doc_url: string | null
  zillow_screenshot_url: string | null
  images: string[] | null
  amenities: string[] | null
  is_active: boolean
  verification_status: VerificationStatus
  created_at: string
  updated_at: string
  // Enhanced property fields
  year_built?: number | null
  lot_acres?: number | null
  hoa_fee?: number | null
  property_type?: string | null
  mls_id?: string | null
  source_feed_id?: string | null
  list_date?: string | null
  days_on_market?: number | null
  is_seed_property?: boolean
  last_feed_update?: string | null
  last_user_update?: string | null
  // Rich data fields (JSONB)
  property_features?: Record<string, any> | null
  location_community?: Record<string, any> | null
  building_info?: Record<string, any> | null
  lot_info?: Record<string, any> | null
  interior_features?: string[] | null
  original_image_urls?: string[] | null
}

export interface PropertyImport {
  id: string
  admin_id: string
  import_type: string
  source_file: string | null
  properties_processed: number
  properties_created: number
  properties_updated: number
  properties_errors: number
  import_status: string
  error_details: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface PropertyClaim {
  id: string
  property_id: string
  claimant_id: string
  claim_status: string
  claim_reason: string | null
  verification_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  property_id: string
  buyer_id: string
  check_in_date: string
  check_out_date: string
  total_nights: number
  price_per_night: number
  subtotal: number
  platform_fee: number
  seller_agent_fee: number
  buyer_agent_fee: number
  seller_payout: number
  stripe_payment_intent_id: string | null
  status: BookingStatus
  buyer_agent_name: string | null
  buyer_agent_email: string | null
  created_at: string
  updated_at: string
}
