import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey)

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const userRole = formData.get('userRole') as string
    const metadata = JSON.parse(formData.get('metadata') as string)

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload a PDF or image file.' 
      }, { status: 400 })
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate filename with hash to prevent duplicates
    const fileExtension = file.name.split('.').pop()
    const fileHash = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
    const hashString = Array.from(new Uint8Array(fileHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 16) // Use first 16 characters for shorter filename
    const fileName = `${userId}_${hashString}.${fileExtension}`

    // Try to upload to Supabase Storage
    // First, try to create the bucket if it doesn't exist
    const { error: bucketError } = await supabase.storage.createBucket('verification-documents', {
      public: false,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
      fileSizeLimit: 10485760 // 10MB
    })

    // If bucket already exists, we'll get an error but that's okay
    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('Bucket creation error:', bucketError)
    }

    // Check if file already exists
    const { data: existingFile } = await supabase.storage
      .from('verification-documents')
      .list('', {
        search: fileName
      })

    if (existingFile && existingFile.length > 0) {
      // File already exists, return the existing URL
      const { data: urlData } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(fileName)

      return NextResponse.json({
        success: true,
        documentUrl: urlData.publicUrl,
        fileName: fileName,
        message: 'Document already uploaded. Verification is pending review.',
        isDuplicate: true
      })
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ 
        error: `Failed to upload file: ${uploadError.message}` 
      }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(fileName)

    // For now, return success with the file URL
    // In production, this would also save to the verification_documents table
    
    return NextResponse.json({
      success: true,
      documentUrl: urlData.publicUrl,
      fileName: fileName,
      message: 'Document uploaded successfully. Verification is pending review.'
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload document' 
    }, { status: 500 })
  }
}
