"use client"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Database, AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react"
import { PropertyImport } from "@/lib/types"

interface PropertyFeedImportProps {
  currentUserId: string
  currentUserRole: string
  onImportComplete?: () => void
}

export function PropertyFeedImport({ currentUserId, currentUserRole, onImportComplete }: PropertyFeedImportProps) {
  const [imports, setImports] = useState<PropertyImport[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importType, setImportType] = useState<"json" | "csv">("json")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    propertyCount: number
    dataQuality: number
    issues: string[]
    warnings: string[]
  } | null>(null)
  const [validating, setValidating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const { user } = useUser()

  useEffect(() => {
    fetchImports()
  }, [])

  const fetchImports = async () => {
    console.log("Fetching property imports...")
    try {
      const { data, error } = await supabase
        .from("property_imports")
        .select("*")
        .order("created_at", { ascending: false })

      console.log("Imports fetch result:", { data, error })

      if (error) {
        console.error("Error fetching imports:", error)
      } else {
        setImports(data || [])
        console.log("Imports set:", data || [])
      }
    } catch (error) {
      console.error("Error fetching imports:", error)
    } finally {
      setLoading(false)
    }
  }

  const validateFile = async (file: File) => {
    setValidating(true)
    setValidationResult(null)
    
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      if (!Array.isArray(data)) {
        setValidationResult({
          isValid: false,
          propertyCount: 0,
          dataQuality: 0,
          issues: ["File must contain an array of properties"],
          warnings: []
        })
        return
      }

      const propertyCount = data.length
      const issues: string[] = []
      const warnings: string[] = []

      // Check for empty dataset
      if (propertyCount === 0) {
        issues.push("Dataset is empty")
      }

      // Analyze first property structure
      if (propertyCount > 0) {
        const firstProperty = data[0]
        
        // Check for essential fields
        const hasAddress = firstProperty.address
        const hasDescription = firstProperty.description
        const hasPhotos = firstProperty.photos && Array.isArray(firstProperty.photos) && firstProperty.photos.length > 0
        const hasPrice = firstProperty.list_price && firstProperty.list_price > 0

        if (!hasAddress) issues.push("Properties missing address information")
        if (!hasDescription) issues.push("Properties missing description information")
        if (!hasPhotos) warnings.push("Properties missing photos")
        if (!hasPrice) warnings.push("Properties missing pricing information")

        // Check format compatibility
        const isNewFormat = firstProperty.address && typeof firstProperty.address === 'object'
        if (!isNewFormat && !hasAddress) {
          issues.push("Address format not recognized")
        }
      }

      // Calculate data quality score
      const qualityChecks = [
        propertyCount > 0,
        data.length > 0 && data[0].address,
        data.length > 0 && data[0].description,
        data.length > 0 && data[0].photos && Array.isArray(data[0].photos),
        data.length > 0 && data[0].list_price
      ]
      const dataQuality = Math.round((qualityChecks.filter(Boolean).length / qualityChecks.length) * 100)

      setValidationResult({
        isValid: issues.length === 0,
        propertyCount,
        dataQuality,
        issues,
        warnings
      })

    } catch (error) {
      setValidationResult({
        isValid: false,
        propertyCount: 0,
        dataQuality: 0,
        issues: [`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      })
    } finally {
      setValidating(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Auto-detect file type based on extension
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (extension === 'csv') {
        setImportType('csv')
      } else {
        setImportType('json')
      }
      
      setValidationResult(null) // Clear previous validation
      
      // Auto-validate JSON files
      if (extension === 'json') {
        validateFile(file)
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !user?.id) return

    // Check validation result before proceeding
    if (validationResult && !validationResult.isValid) {
      alert("Please fix the validation issues before uploading.")
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('importType', importType)
      formData.append('adminId', user.id)

      const response = await fetch('/api/admin/import-properties', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        // Refresh imports list
        await fetchImports()
        
        // Trigger stats refresh in parent component
        if (onImportComplete) {
          onImportComplete()
        }
        
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        setUploadProgress(0)
      } else {
        console.error('Upload failed:', result.error)
        alert(`Upload failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'processing':
        return <Badge variant="outline" className="border-blue-300 text-blue-700"><RefreshCw className="h-3 w-3 mr-1" />Processing</Badge>
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-600">Loading import history...</div>
  }

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Property Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-slate-600">Upload a JSON or CSV file with property data</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {selectedFile ? selectedFile.name : "Choose File"}
              </Button>
            </div>
          </div>

          {selectedFile && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">File Type:</span>
                <Badge variant="outline">{importType.toUpperCase()}</Badge>
                <span className="text-sm text-slate-600">Size: {(selectedFile.size / 1024).toFixed(1)} KB</span>
              </div>

              {/* Validation Results */}
              {validating && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-700">Validating file...</span>
                </div>
              )}

              {validationResult && (
                <div className={`p-4 rounded-lg border ${
                  validationResult.isValid 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    {validationResult.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-medium ${
                      validationResult.isValid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {validationResult.isValid ? 'File Validated Successfully' : 'Validation Failed'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-slate-500" />
                      <span>Properties: {validationResult.propertyCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Data Quality:</span>
                      <span className={`font-medium ${
                        validationResult.dataQuality >= 90 ? 'text-green-600' :
                        validationResult.dataQuality >= 75 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {validationResult.dataQuality}%
                      </span>
                    </div>
                  </div>

                  {validationResult.issues.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-red-800 mb-2">Issues:</p>
                      <ul className="text-sm text-red-700 space-y-1">
                        {validationResult.issues.map((issue, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validationResult.warnings.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-yellow-800 mb-2">Warnings:</p>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {validationResult.warnings.map((warning, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-yellow-500 mt-0.5">•</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Processing import...</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={uploading || (validationResult && !validationResult.isValid)}
                className="w-full"
              >
                {uploading ? "Processing..." : "Import Properties"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Import History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {imports.length === 0 ? (
            <div className="text-center py-8 text-slate-600">
              <Database className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p>No imports yet. Upload your first property feed to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {imports.map((importRecord) => (
                <div key={importRecord.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {importRecord.source_file || 'Manual Import'}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {importRecord.import_type} • {formatDate(importRecord.created_at)}
                      </p>
                    </div>
                    {getStatusBadge(importRecord.import_status)}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Processed:</span>
                      <span className="ml-1 font-medium">{importRecord.properties_processed}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Created:</span>
                      <span className="ml-1 font-medium text-green-600">{importRecord.properties_created}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Updated:</span>
                      <span className="ml-1 font-medium text-blue-600">{importRecord.properties_updated}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Errors:</span>
                      <span className="ml-1 font-medium text-red-600">{importRecord.properties_errors}</span>
                    </div>
                  </div>

                  {importRecord.error_details && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-700 font-semibold mb-2">Import Errors:</p>
                      <div className="space-y-2">
                        {Array.isArray(importRecord.error_details) ? (
                          importRecord.error_details.map((error: any, index: number) => (
                            <div key={index} className="text-xs bg-red-100 p-2 rounded border-l-2 border-red-400">
                              <div className="font-medium text-red-800">
                                Property: {error.property?.title || error.property?.address || 'Unknown'}
                              </div>
                              <div className="text-red-700 mt-1">
                                {error.error || error.message || 'Unknown error'}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs bg-red-100 p-2 rounded border-l-2 border-red-400">
                            <div className="text-red-700">
                              {typeof importRecord.error_details === 'string' 
                                ? importRecord.error_details 
                                : JSON.stringify(importRecord.error_details, null, 2)
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
