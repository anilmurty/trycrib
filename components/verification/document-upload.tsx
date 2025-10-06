"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface DocumentUploadProps {
  userRole: 'buyer' | 'seller'
  onUpload: (file: File, metadata: any) => Promise<void>
  isUploading: boolean
  uploadError: string | null
}

export default function DocumentUpload({ userRole, onUpload, isUploading, uploadError }: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or image file (JPG, PNG)')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    const metadata = {
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      mimeType: selectedFile.type,
      uploadedAt: new Date().toISOString()
    }

    await onUpload(selectedFile, metadata)
  }

  const getDocumentRequirements = () => {
    if (userRole === 'seller') {
      return {
        title: "Property Ownership Verification",
        description: "Upload your property tax statement or property information screenshot",
        requirements: [
          "Property tax statement showing your name and property address",
          "OR screenshot from Clark County Property Information Center",
          "Document must clearly show property owner name and address",
          "File formats: PDF, JPG, or PNG (max 10MB)"
        ]
      }
    } else {
      return {
        title: "Loan Pre-Approval Verification",
        description: "Upload your loan pre-approval letter",
        requirements: [
          "Pre-approval letter (within the last 3 months - NOT ENFORCED for testing)",
          "Must show pre-approval amount and lender name",
          "Document must be clear and readable",
          "File formats: PDF, JPG, or PNG (max 10MB)"
        ]
      }
    }
  }

  const requirements = getDocumentRequirements()

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {requirements.title}
        </CardTitle>
        <CardDescription>
          {requirements.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Requirements */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-900">Requirements:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {requirements.requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : selectedFile
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFile(null)}
              >
                Remove File
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-base font-medium text-gray-900">
                  Drop your document here, or{' '}
                  <button
                    className="text-blue-600 hover:text-blue-500 text-lg font-semibold cursor-pointer underline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-gray-500">
                  PDF, JPG, or PNG up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileInput}
          className="hidden"
        />

        {/* Error Display */}
        {uploadError && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
