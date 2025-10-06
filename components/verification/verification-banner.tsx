"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface VerificationBannerProps {
  userRole: 'buyer' | 'seller'
  className?: string
}

export default function VerificationBanner({ userRole, className = "" }: VerificationBannerProps) {
  const router = useRouter()
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'approved' | 'rejected' | 'expired' | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchVerificationStatus()
  }, [])

  const fetchVerificationStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/verification/status')
      if (response.ok) {
        const data = await response.json()
        setVerificationStatus(data.verificationStatus)
      }
    } catch (error) {
      console.error('Error fetching verification status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyNow = () => {
    router.push('/verification')
  }

  if (isLoading) {
    return null
  }

  // Don't show banner if verification is approved
  if (verificationStatus === 'approved') {
    return null
  }

  const getBannerContent = () => {
    if (verificationStatus === 'pending') {
      return {
        icon: <Clock className="h-5 w-5 text-blue-500" />,
        title: 'Verification Pending',
        description: 'Thank you for submitting your document(s) for verification. They are under review and will be approved soon.',
        color: 'border-blue-200 bg-blue-50',
        textColor: 'text-blue-800',
        actionText: 'View Status',
        actionVariant: 'outline' as const,
        showAction: false // Don't show action button for pending
      }
    } else if (verificationStatus === 'rejected') {
      return {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        title: 'Verification Rejected',
        description: 'Your verification was rejected. Please upload a new document to continue.',
        color: 'border-red-200 bg-red-50',
        textColor: 'text-red-800',
        actionText: 'Try Again',
        actionVariant: 'default' as const,
        showAction: true
      }
    } else {
      // Not verified or expired
      return {
        icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
        title: 'Verification Required',
        description: userRole === 'buyer' 
          ? 'Complete verification to schedule property visits and access all features.'
          : 'Complete verification to list properties and access all features.',
        color: 'border-orange-200 bg-orange-50',
        textColor: 'text-orange-800',
        actionText: 'Verify Now',
        actionVariant: 'default' as const,
        showAction: true
      }
    }
  }

  const content = getBannerContent()

  return (
    <Card className={`${content.color} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {content.icon}
            <div>
              <h3 className={`font-semibold ${content.textColor}`}>
                {content.title}
              </h3>
              <p className={`text-sm ${content.textColor} opacity-90`}>
                {content.description}
              </p>
            </div>
          </div>
          {content.showAction && (
            <Button
              onClick={handleVerifyNow}
              variant={content.actionVariant}
              size="sm"
              className="flex items-center gap-2"
            >
              {content.actionText}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
