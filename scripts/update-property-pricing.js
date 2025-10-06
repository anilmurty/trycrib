#!/usr/bin/env node

/**
 * Update Property Pricing Script
 * This script updates existing properties with calculated pricing tiers and nightly rates
 */

const { createClient } = require('@supabase/supabase-js')

// Read environment variables from .env.local
const fs = require('fs')
const path = require('path')

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const envLines = envContent.split('\n')
    
    envLines.forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        process.env[key.trim()] = value
      }
    })
  }
}

loadEnvFile()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Pricing tier calculation function
function calculatePricingTier(listingPrice) {
  if (!listingPrice || listingPrice <= 0) return null
  
  if (listingPrice < 500000) return 'under_500k'
  if (listingPrice < 1000000) return '500k_1m'
  if (listingPrice < 1500000) return '1m_1_5m'
  if (listingPrice < 3000000) return '1_5m_3m'
  if (listingPrice < 5000000) return '3m_5m'
  return 'over_5m'
}

// Price per night calculation function
function calculatePricePerNight(tier) {
  const pricing = {
    'under_500k': 500,
    '500k_1m': 750,
    '1m_1_5m': 1250,
    '1_5m_3m': 1500,
    '3m_5m': 2000,
    'over_5m': null
  }
  return pricing[tier] || null
}

async function updatePropertyPricing() {
  console.log('🚀 Starting property pricing update...')
  
  try {
    // First, let's check if the pricing columns exist
    console.log('📋 Checking database schema...')
    
    // Get all properties with listing_price
    const { data: properties, error: fetchError } = await supabase
      .from('properties')
      .select('id, title, listing_price, pricing_tier, calculated_price_per_night')
      .not('listing_price', 'is', null)
      .gt('listing_price', 0)
    
    if (fetchError) {
      console.error('❌ Error fetching properties:', fetchError)
      return
    }
    
    console.log(`📊 Found ${properties.length} properties with listing prices`)
    
    if (properties.length === 0) {
      console.log('ℹ️  No properties to update')
      return
    }
    
    // Process properties in batches
    const batchSize = 50
    let updated = 0
    let errors = 0
    
    for (let i = 0; i < properties.length; i += batchSize) {
      const batch = properties.slice(i, i + batchSize)
      console.log(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(properties.length / batchSize)}`)
      
      const updates = batch.map(property => {
        const tier = calculatePricingTier(property.listing_price)
        const pricePerNight = calculatePricePerNight(tier)
        
        return {
          id: property.id,
          pricing_tier: tier,
          calculated_price_per_night: pricePerNight,
          pricing_override: false
        }
      })
      
      // Update batch
      for (const update of updates) {
        try {
          const { error: updateError } = await supabase
            .from('properties')
            .update({
              pricing_tier: update.pricing_tier,
              calculated_price_per_night: update.calculated_price_per_night,
              pricing_override: update.pricing_override
            })
            .eq('id', update.id)
          
          if (updateError) {
            console.error(`❌ Error updating property ${update.id}:`, updateError.message)
            errors++
          } else {
            updated++
            console.log(`✅ Updated ${update.id}: ${update.pricing_tier} -> $${update.calculated_price_per_night || 'Contact Seller'}/night`)
          }
        } catch (err) {
          console.error(`❌ Exception updating property ${update.id}:`, err.message)
          errors++
        }
      }
    }
    
    console.log('\n📈 Update Summary:')
    console.log(`✅ Successfully updated: ${updated} properties`)
    console.log(`❌ Errors: ${errors} properties`)
    console.log(`📊 Total processed: ${properties.length} properties`)
    
    // Show pricing tier distribution
    console.log('\n📊 Pricing Tier Distribution:')
    const tierCounts = {}
    properties.forEach(property => {
      const tier = calculatePricingTier(property.listing_price)
      tierCounts[tier] = (tierCounts[tier] || 0) + 1
    })
    
    Object.entries(tierCounts).forEach(([tier, count]) => {
      const pricePerNight = calculatePricePerNight(tier)
      const priceDisplay = pricePerNight ? `$${pricePerNight}/night` : 'Contact Seller'
      console.log(`  ${tier}: ${count} properties (${priceDisplay})`)
    })
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

// Run the script
updatePropertyPricing()
  .then(() => {
    console.log('\n🎉 Property pricing update completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
