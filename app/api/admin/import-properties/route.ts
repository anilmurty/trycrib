import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin or superadmin
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const importType = formData.get('importType') as string
    const adminId = formData.get('adminId') as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Create import record
    const { data: importRecord, error: importError } = await supabase
      .from('property_imports')
      .insert({
        admin_id: adminId,
        import_type: importType,
        source_file: file.name,
        properties_processed: 0,
        properties_created: 0,
        properties_updated: 0,
        properties_errors: 0,
        import_status: 'processing',
        error_details: null
      })
      .select()
      .single()

    if (importError) {
      console.error("Error creating import record:", importError)
      return NextResponse.json({ error: "Failed to create import record" }, { status: 500 })
    }

    try {
      // Process the file based on type
      let properties: any[] = []
      
      if (importType === 'json') {
        const text = await file.text()
        const jsonData = JSON.parse(text)
        
        // Handle different JSON structures
        if (Array.isArray(jsonData)) {
          properties = jsonData
        } else if (jsonData.properties && Array.isArray(jsonData.properties)) {
          properties = jsonData.properties
        } else if (jsonData.data && Array.isArray(jsonData.data)) {
          properties = jsonData.data
        } else {
          throw new Error("Invalid JSON structure. Expected array of properties or object with 'properties' or 'data' field.")
        }
      } else if (importType === 'csv') {
        // For now, we'll handle CSV as JSON
        // In a real implementation, you'd use a CSV parser
        throw new Error("CSV import not yet implemented. Please use JSON format.")
      }

      console.log(`Processing ${properties.length} properties...`)

      let processed = 0
      let created = 0
      let updated = 0
      let errors = 0
      const errorDetails: any[] = []

      // Process each property
      for (const propertyData of properties) {
        try {
          processed++

          // Map the property data to our schema
          const mappedProperty = mapPropertyData(propertyData)
          
          // Check if property already exists (by address or MLS ID)
          const { data: existingProperty } = await supabase
            .from('properties')
            .select('id, seller_id')
            .or(`address.eq.${mappedProperty.address},mls_id.eq.${mappedProperty.mls_id}`)
            .single()

          if (existingProperty) {
            // Update existing property (only if it's a seed property or owned by the same seller)
            if (existingProperty.seller_id === null || existingProperty.seller_id === mappedProperty.seller_id) {
              const { error: updateError } = await supabase
                .from('properties')
                .update({
                  ...mappedProperty,
                  last_feed_update: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingProperty.id)

              if (updateError) {
                console.error("Error updating property:", updateError)
                errors++
                errorDetails.push({ property: mappedProperty, error: updateError.message })
              } else {
                updated++
              }
            }
          } else {
            // Create new property
            const { error: insertError } = await supabase
              .from('properties')
              .insert({
                ...mappedProperty,
                is_seed_property: true,
                seller_id: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })

            if (insertError) {
              console.error("Error creating property:", insertError)
              errors++
              errorDetails.push({ property: mappedProperty, error: insertError.message })
            } else {
              created++
            }
          }
        } catch (propertyError) {
          console.error("Error processing property:", propertyError)
          errors++
          errorDetails.push({ property: propertyData, error: propertyError.message })
        }
      }

      // Update import record with results
      const { error: updateError } = await supabase
        .from('property_imports')
        .update({
          properties_processed: processed,
          properties_created: created,
          properties_updated: updated,
          properties_errors: errors,
          import_status: errors > 0 ? 'completed_with_errors' : 'completed',
          error_details: errorDetails.length > 0 ? errorDetails : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', importRecord.id)

      if (updateError) {
        console.error("Error updating import record:", updateError)
      }

      return NextResponse.json({
        success: true,
        message: `Import completed. Processed: ${processed}, Created: ${created}, Updated: ${updated}, Errors: ${errors}`,
        results: {
          processed,
          created,
          updated,
          errors
        }
      })

    } catch (processingError) {
      console.error("Error processing file:", processingError)
      
      // Update import record with error
      await supabase
        .from('property_imports')
        .update({
          import_status: 'failed',
          error_details: { error: processingError.message },
          updated_at: new Date().toISOString()
        })
        .eq('id', importRecord.id)

      return NextResponse.json({ 
        error: `Failed to process file: ${processingError.message}` 
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Error in import-properties API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to map property data from feed to our schema
function mapPropertyData(propertyData: any) {
  return {
    title: propertyData.title || propertyData.name || propertyData.property_title || 'Untitled Property',
    address: propertyData.address || propertyData.street_address || '',
    city: propertyData.city || '',
    state: propertyData.state || propertyData.state_code || '',
    zip_code: propertyData.zip_code || propertyData.zip || propertyData.postal_code || '',
    listing_price: parseFloat(propertyData.listing_price || propertyData.price || propertyData.list_price || 0),
    bedrooms: parseInt(propertyData.bedrooms || propertyData.beds || 0),
    bathrooms: parseFloat(propertyData.bathrooms || propertyData.baths || 0),
    square_feet: parseInt(propertyData.square_feet || propertyData.sqft || propertyData.area || 0),
    year_built: parseInt(propertyData.year_built || propertyData.year_constructed || 0) || null,
    lot_acres: parseFloat(propertyData.lot_acres || propertyData.acres || 0) || null,
    hoa_fee: parseFloat(propertyData.hoa_fee || propertyData.hoa || 0) || null,
    property_type: propertyData.property_type || propertyData.type || 'Single Family',
    mls_id: propertyData.mls_id || propertyData.mls_number || propertyData.listing_id || null,
    source_feed_id: propertyData.id || propertyData.property_id || null,
    list_date: propertyData.list_date || propertyData.date_listed || null,
    days_on_market: parseInt(propertyData.days_on_market || propertyData.dom || 0) || null,
    property_features: propertyData.features || propertyData.amenities || null,
    location_community: propertyData.location || propertyData.community || null,
    building_info: propertyData.building || propertyData.construction || null,
    lot_info: propertyData.lot || propertyData.lot_details || null,
    interior_features: propertyData.interior_features || propertyData.interior || null,
    original_image_urls: propertyData.images || propertyData.photos || propertyData.image_urls || null,
    description: propertyData.description || propertyData.remarks || propertyData.notes || '',
    status: propertyData.status || propertyData.listing_status || 'active',
    price_per_night: propertyData.price_per_night || propertyData.nightly_rate || 0
  }
}
