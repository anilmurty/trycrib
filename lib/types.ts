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
  seller_id: string
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
