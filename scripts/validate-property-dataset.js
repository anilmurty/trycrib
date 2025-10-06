#!/usr/bin/env node

/**
 * Property Dataset Validation Script
 * 
 * Validates JSON property datasets and provides detailed analysis
 * Usage: node scripts/validate-property-dataset.js <filename>
 * Example: node scripts/validate-property-dataset.js washougal-full-oct-5.json
 */

const fs = require('fs');
const path = require('path');

function validatePropertyDataset(filename) {
  console.log(`🔍 Validating property dataset: ${filename}\n`);
  
  try {
    // Check if file exists
    if (!fs.existsSync(filename)) {
      console.log(`❌ File not found: ${filename}`);
      return;
    }

    // Get file stats
    const stats = fs.statSync(filename);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`📁 File size: ${fileSizeMB} MB`);

    // Parse JSON
    const rawData = fs.readFileSync(filename, 'utf8');
    const data = JSON.parse(rawData);
    
    console.log(`✅ Valid JSON format`);
    console.log(`📊 Total properties: ${data.length}`);
    
    if (data.length === 0) {
      console.log(`⚠️  Warning: Dataset is empty`);
      return;
    }

    // Analyze first property structure
    const firstProperty = data[0];
    console.log(`\n🏠 Property Structure Analysis:`);
    console.log(`   Address type: ${typeof firstProperty.address}`);
    console.log(`   Description type: ${typeof firstProperty.description}`);
    console.log(`   Photos type: ${Array.isArray(firstProperty.photos) ? 'array' : typeof firstProperty.photos}`);
    
    // Check if it's new format (address is object)
    const isNewFormat = firstProperty.address && typeof firstProperty.address === 'object';
    console.log(`   Format: ${isNewFormat ? 'New (structured)' : 'Old (string-based)'}`);
    
    // Address analysis
    if (isNewFormat) {
      console.log(`\n📍 Address Analysis:`);
      console.log(`   City: ${firstProperty.address.city || 'N/A'}`);
      console.log(`   State: ${firstProperty.address.state_code || firstProperty.address.state || 'N/A'}`);
      console.log(`   Zip: ${firstProperty.address.postal_code || 'N/A'}`);
      console.log(`   Coordinates: ${firstProperty.address.coordinate ? 'Yes' : 'No'}`);
    } else {
      console.log(`\n📍 Address Analysis:`);
      console.log(`   Address string: ${firstProperty.address || 'N/A'}`);
    }

    // Description analysis
    if (firstProperty.description) {
      console.log(`\n📝 Description Analysis:`);
      const descKeys = Object.keys(firstProperty.description);
      console.log(`   Description fields: ${descKeys.length}`);
      console.log(`   Key fields: ${descKeys.slice(0, 10).join(', ')}${descKeys.length > 10 ? '...' : ''}`);
      
      // Check for essential fields
      const essentialFields = ['beds', 'baths', 'sqft', 'type'];
      const missingFields = essentialFields.filter(field => !firstProperty.description[field]);
      if (missingFields.length > 0) {
        console.log(`   ⚠️  Missing essential fields: ${missingFields.join(', ')}`);
      } else {
        console.log(`   ✅ All essential fields present`);
      }
    }

    // Photos analysis
    if (firstProperty.photos && Array.isArray(firstProperty.photos)) {
      console.log(`\n📸 Photos Analysis:`);
      console.log(`   Photos per property: ${firstProperty.photos.length}`);
      
      // Check photo structure
      const firstPhoto = firstProperty.photos[0];
      if (firstPhoto) {
        if (typeof firstPhoto === 'string') {
          console.log(`   Photo format: String URLs`);
        } else if (firstPhoto.href) {
          console.log(`   Photo format: Objects with href property`);
        } else {
          console.log(`   Photo format: Unknown structure`);
        }
      }
    }

    // Price analysis
    const prices = data.map(p => p.list_price || 0).filter(p => p > 0);
    if (prices.length > 0) {
      console.log(`\n💰 Price Analysis:`);
      console.log(`   Properties with prices: ${prices.length}/${data.length}`);
      console.log(`   Price range: $${Math.min(...prices).toLocaleString()} - $${Math.max(...prices).toLocaleString()}`);
      console.log(`   Average price: $${Math.round(prices.reduce((a, b) => a + b, 0) / prices.length).toLocaleString()}`);
    }

    // Data quality checks
    console.log(`\n🔍 Data Quality Checks:`);
    
    // Check for missing essential data
    const propertiesWithAddress = data.filter(p => p.address).length;
    const propertiesWithDescription = data.filter(p => p.description).length;
    const propertiesWithPhotos = data.filter(p => p.photos && p.photos.length > 0).length;
    const propertiesWithPrice = data.filter(p => p.list_price && p.list_price > 0).length;
    
    console.log(`   Properties with address: ${propertiesWithAddress}/${data.length} (${Math.round(propertiesWithAddress/data.length*100)}%)`);
    console.log(`   Properties with description: ${propertiesWithDescription}/${data.length} (${Math.round(propertiesWithDescription/data.length*100)}%)`);
    console.log(`   Properties with photos: ${propertiesWithPhotos}/${data.length} (${Math.round(propertiesWithPhotos/data.length*100)}%)`);
    console.log(`   Properties with price: ${propertiesWithPrice}/${data.length} (${Math.round(propertiesWithPrice/data.length*100)}%)`);

    // Import readiness assessment
    console.log(`\n🚀 Import Readiness Assessment:`);
    const readinessScore = (propertiesWithAddress + propertiesWithDescription + propertiesWithPhotos + propertiesWithPrice) / (data.length * 4) * 100;
    console.log(`   Overall data quality: ${Math.round(readinessScore)}%`);
    
    if (readinessScore >= 90) {
      console.log(`   ✅ Excellent - Ready for import`);
    } else if (readinessScore >= 75) {
      console.log(`   ⚠️  Good - Minor data quality issues`);
    } else if (readinessScore >= 50) {
      console.log(`   ⚠️  Fair - Some data quality concerns`);
    } else {
      console.log(`   ❌ Poor - Significant data quality issues`);
    }

    // Sample property preview
    console.log(`\n📋 Sample Property Preview:`);
    console.log(`   Title: ${firstProperty.description?.name || 'N/A'}`);
    console.log(`   Address: ${isNewFormat ? firstProperty.address.line : firstProperty.address}`);
    console.log(`   Beds: ${firstProperty.description?.beds || 'N/A'}`);
    console.log(`   Baths: ${firstProperty.description?.baths || 'N/A'}`);
    console.log(`   Sqft: ${firstProperty.description?.sqft || 'N/A'}`);
    console.log(`   Price: $${firstProperty.list_price?.toLocaleString() || 'N/A'}`);

    console.log(`\n✅ Validation complete!`);

  } catch (error) {
    console.log(`❌ Validation failed:`);
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('Unexpected end of JSON input')) {
      console.log(`   💡 This usually means the JSON file is corrupted or incomplete`);
    } else if (error.message.includes('Unexpected token')) {
      console.log(`   💡 This usually means there's a syntax error in the JSON`);
    }
  }
}

// Get filename from command line arguments
const filename = process.argv[2];

if (!filename) {
  console.log('Usage: node scripts/validate-property-dataset.js <filename>');
  console.log('Example: node scripts/validate-property-dataset.js washougal-full-oct-5.json');
  process.exit(1);
}

validatePropertyDataset(filename);
