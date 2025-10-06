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
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !user?.id) return

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
                disabled={uploading}
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
