"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  RefreshCw,
  ExternalLink
} from 'lucide-react'

interface VerificationStatusProps {
  userRole: 'buyer' | 'seller'
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'expired' | null
  lastAttempt?: string
  rejectionReason?: string
  verificationNotes?: string
  onRetry?: () => void
  onViewDocument?: () => void
}

export default function VerificationStatus({
  userRole,
  verificationStatus,
  lastAttempt,
  rejectionReason,
  verificationNotes,
  onRetry,
  onViewDocument
}: VerificationStatusProps) {
  const getStatusInfo = () => {
    switch (verificationStatus) {
      case 'approved':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          title: 'Verification Approved',
          description: 'Your identity has been successfully verified.',
          badge: <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>,
          color: 'text-green-700'
        }
      case 'rejected':
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          title: 'Verification Rejected',
          description: rejectionReason || 'Your verification was rejected. Please try again.',
          badge: <Badge variant="destructive">Rejected</Badge>,
          color: 'text-red-700'
        }
      case 'expired':
        return {
          icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
          title: 'Verification Expired',
          description: 'Your verification has expired. Please submit a new document.',
          badge: <Badge variant="secondary" className="bg-orange-100 text-orange-800">Expired</Badge>,
          color: 'text-orange-700'
        }
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5 text-blue-500" />,
          title: 'Verification Pending',
          description: 'Your document is being reviewed. This usually takes 1-2 business days.',
          badge: <Badge variant="secondary" className="bg-blue-100 text-blue-800">Pending</Badge>,
          color: 'text-blue-700'
        }
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
          title: 'Not Verified',
          description: 'Please upload a document to verify your identity.',
          badge: <Badge variant="outline">Not Verified</Badge>,
          color: 'text-gray-700'
        }
    }
  }

  const statusInfo = getStatusInfo()

  const getDocumentType = () => {
    if (userRole === 'seller') {
      return 'Property ownership document'
    } else {
      return 'Loan pre-approval letter'
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {statusInfo.icon}
            <span className={statusInfo.color}>{statusInfo.title}</span>
          </div>
          {statusInfo.badge}
        </CardTitle>
        <CardDescription>
          {statusInfo.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Type */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText className="h-4 w-4" />
          <span>Document Type: {getDocumentType()}</span>
        </div>

        {/* Last Attempt */}
        {lastAttempt && (
          <div className="text-sm text-gray-500">
            Last submitted: {new Date(lastAttempt).toLocaleDateString()}
          </div>
        )}

        {/* Rejection Reason */}
        {verificationStatus === 'rejected' && rejectionReason && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start gap-2">
              <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                <p className="text-sm text-red-700">{rejectionReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Verification Notes */}
        {verificationNotes && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Admin Notes:</p>
                <p className="text-sm text-blue-700">{verificationNotes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {verificationStatus === 'rejected' || verificationStatus === 'expired' || !verificationStatus ? (
            <Button onClick={onRetry} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              {verificationStatus ? 'Try Again' : 'Upload Document'}
            </Button>
          ) : null}
          
          {verificationStatus && onViewDocument && (
            <Button variant="outline" onClick={onViewDocument}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Document
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          {userRole === 'seller' ? (
            <p>
              Need help? Contact support if you have questions about property verification.
            </p>
          ) : (
            <p>
              Need help? Contact support if you have questions about pre-approval verification.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
