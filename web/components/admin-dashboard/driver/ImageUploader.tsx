"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, X, Image as ImageIcon, Loader2, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
  onFileUpload: (file: File) => void
  isUploading?: boolean
  uploadProgress?: number
  currentImage?: string
  className?: string
  accept?: string
  maxSize?: number
}

export function ImageUploader({
  onFileUpload,
  isUploading = false,
  uploadProgress = 0,
  currentImage,
  className,
  accept = "image/jpeg,image/jpg,image/png,image/webp,application/pdf",
  maxSize = 5 * 1024 * 1024, // 5MB default
}: ImageUploaderProps) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clear preview when currentImage changes
  useEffect(() => {
    if (currentImage) {
      setLocalPreview(null)
    }
  }, [currentImage])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    setError(null)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFile(files[0])
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const processFile = (file: File) => {
    // Validate file type
    const fileType = file.type
    const fileName = file.name.toLowerCase()
    const isValidImage = fileType.startsWith("image/")
    const isValidPdf = fileType === "application/pdf"
    const isValidExtension = [".jpg", ".jpeg", ".png", ".webp", ".pdf"].some(
      (ext) => fileName.endsWith(ext),
    )

    if (!isValidImage && !isValidPdf && !isValidExtension) {
      setError("Invalid file type. Please upload JPG, PNG, WEBP, or PDF files.")
      return
    }

    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      setError(`File size too large. Maximum size is ${maxSizeMB}MB.`)
      return
    }

    // Create local preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLocalPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else if (file.type === "application/pdf") {
      // For PDFs, we'll show a PDF icon
      setLocalPreview("pdf")
    }

    // Call the upload handler
    onFileUpload(file)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const getFileName = () => {
    if (fileInputRef.current?.files?.[0]) {
      return fileInputRef.current.files[0].name
    }
    return null
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer group",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5",
          (currentImage || localPreview) && "border-solid",
          error && "border-destructive",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
        />

        {isUploading ? (
          <div className="aspect-square flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </div>
        ) : localPreview ? (
          // Local preview (before upload completes)
          <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
            {localPreview === "pdf" ? (
              <div className="h-full w-full flex flex-col items-center justify-center p-4">
                <FileText className="h-16 w-16 text-primary mb-4" />
                <p className="text-sm font-medium text-center truncate max-w-full px-2">
                  {getFileName() || "PDF Document"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click to change
                </p>
              </div>
            ) : (
              <>
                <img
                  src={localPreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="text-white text-center p-4">
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">
                      Click or drag to replace
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : currentImage ? (
          // Remote image (after upload completes)
          <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
            <img
              src={currentImage}
              alt="Uploaded"
              className="h-full w-full object-cover"
              onError={(e) => {
                // If the image fails to load (mock URL might be invalid), show a placeholder
                const target = e.target as HTMLImageElement
                target.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Cpath d='M50 35L65 55H35z' fill='%23999'/%3E%3C/svg%3E"
              }}
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="text-white text-center p-4">
                <Upload className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Click or drag to replace</p>
              </div>
            </div>
          </div>
        ) : (
          // Empty state
          <div className="aspect-square flex flex-col items-center justify-center p-8">
            <div className="relative mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full bg-background border flex items-center justify-center">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="font-medium">Drop your file here</p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {accept.includes("pdf")
                  ? "JPG, PNG, PDF up to 5MB"
                  : "JPG, PNG up to 5MB"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File name display */}
      {getFileName() && !currentImage && !isUploading && (
        <div className="text-xs text-muted-foreground px-1">
          Selected: <span className="font-medium">{getFileName()}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <X className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
