"use client"

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/client'
import DocumentUpload from './document-upload'
import VerificationStatus from './verification-status'
import { Header } from '@/components/landing/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Shield, FileText, DollarSign, ArrowLeft, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface VerificationData {
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'expired' | null
  lastAttempt?: string
  rejectionReason?: string
  verificationNotes?: string
  documentUrl?: string
  preapprovalAmount?: number
  propertyAddress?: string
}

export default function VerificationPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const supabase = createClient()
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadCompleted, setUploadCompleted] = useState(false)
  const [userRole, setUserRole] = useState<'buyer' | 'seller'>('buyer')

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserRole()
    }
  }, [isLoaded, user])

  const fetchUserRole = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

      if (profile?.role) {
        setUserRole(profile.role as 'buyer' | 'seller')
      }
      
      // Fetch verification status after getting role
      await fetchVerificationStatus()
    } catch (error) {
      console.error('Error fetching user role:', error)
      // Default to buyer if error
      setUserRole('buyer')
      await fetchVerificationStatus()
    }
  }

  const fetchVerificationStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/verification/status')
      if (response.ok) {
        const data = await response.json()
        setVerificationData(data)
        setShowUpload(!data.verificationStatus || data.verificationStatus === 'rejected' || data.verificationStatus === 'expired')
      }
    } catch (error) {
      console.error('Error fetching verification status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (file: File, metadata: any) => {
    try {
      setIsUploading(true)
      setUploadError(null)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userRole', userRole)
      formData.append('metadata', JSON.stringify(metadata))

      const response = await fetch('/api/verification/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      // Update verification data
      setVerificationData({
        verificationStatus: 'pending',
        lastAttempt: new Date().toISOString(),
        documentUrl: result.documentUrl
      })
      
      setShowUpload(false)
      setUploadCompleted(true)
      
      // Show appropriate message for duplicate uploads
      if (result.isDuplicate) {
        console.log('Document already uploaded - no duplicate created')
      }
      
      // Refresh verification status
      await fetchVerificationStatus()
      
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRetry = () => {
    setShowUpload(true)
    setUploadError(null)
    setUploadCompleted(false)
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  const handleContinue = () => {
    router.push('/dashboard')
  }

  const handleViewDocument = () => {
    if (verificationData?.documentUrl) {
      window.open(verificationData.documentUrl, '_blank')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Identity Verification</h1>
            </div>
            <p className="text-lg text-gray-600">
              Verify your identity to access all platform features
            </p>
          </div>

        {/* Role-specific information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {userRole === 'seller' ? (
                <>
                  <FileText className="h-5 w-5 text-green-600" />
                  Seller Verification
                </>
              ) : (
                <>
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Buyer Verification
                </>
              )}
            </CardTitle>
            <CardDescription>
              {userRole === 'seller' 
                ? 'Verify property ownership to list and manage your properties'
                : 'Verify loan pre-approval to schedule property visits'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userRole === 'seller' ? (
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Upload your property tax statement or property information screenshot</p>
                <p>• Document must show your name and property address</p>
                <p>• Verification helps ensure only legitimate property owners can list properties</p>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Upload your loan pre-approval letter (within last 3 months)</p>
                <p>• Pre-approval amount will be used to filter available properties</p>
                <p>• You can only schedule visits for properties within your budget range</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Completion Success */}
        {uploadCompleted && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Document Uploaded Successfully!
                </h3>
                <p className="text-green-700 mb-6">
                  Your verification document has been uploaded and is now under review. 
                  You'll receive an email notification once the verification is complete.
                </p>
                <Button onClick={handleContinue} className="bg-green-600 hover:bg-green-700">
                  Continue to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verification Status or Upload Form */}
        {!uploadCompleted && showUpload && (
          <div className="space-y-6">
            <DocumentUpload
              userRole={userRole}
              onUpload={handleUpload}
              isUploading={isUploading}
              uploadError={uploadError}
            />
            
            {/* Skip Option */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                You can skip verification for now and complete it later from your dashboard.
              </p>
              <Button variant="outline" onClick={handleSkip}>
                Skip for Now
              </Button>
            </div>
          </div>
        )}
        
        {!uploadCompleted && !showUpload && (
          <VerificationStatus
            userRole={userRole}
            verificationStatus={verificationData?.verificationStatus || null}
            lastAttempt={verificationData?.lastAttempt}
            rejectionReason={verificationData?.rejectionReason}
            verificationNotes={verificationData?.verificationNotes}
            onRetry={handleRetry}
            onViewDocument={verificationData?.documentUrl ? handleViewDocument : undefined}
          />
        )}

        {/* Additional Information */}
        {verificationData?.preapprovalAmount && userRole === 'buyer' && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Your Pre-Approval Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Pre-Approval Amount</p>
                  <p className="text-lg font-semibold">
                    ${verificationData.preapprovalAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Maximum Property Value</p>
                  <p className="text-lg font-semibold">
                    ${Math.round(verificationData.preapprovalAmount * 1.1).toLocaleString()}
                    <span className="text-sm text-gray-500 ml-1">(+10% buffer)</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {verificationData?.propertyAddress && userRole === 'seller' && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Verified Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Property Address</p>
              <p className="text-lg font-semibold">{verificationData.propertyAddress}</p>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  )
}
