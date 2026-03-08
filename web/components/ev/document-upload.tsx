// components/charging-stations/document-upload.tsx
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Upload,
  X,
  CheckCircle2,
  File,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  Download,
  Eye,
  Trash2,
  Grid,
  List,
  AlertCircle,
  FileIcon,
  Shield,
  ScrollText,
  Receipt,
  Building2,
  Tag,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export type DocumentType = "LICENSE" | "PERMIT" | "TAX_CERTIFICATE" | "OTHER";

interface DocumentUploadProps {
  onFilesChange: (files: Array<{ file: File; type: DocumentType }>) => void;
  register: any;
}

interface UploadedFile extends File {
  id: string;
  documentType?: DocumentType;
  uploadStatus?: "success" | "error" | "pending";
  errorMessage?: string;
}

const documentTypeConfig = {
  LICENSE: {
    icon: ScrollText,
    label: "License",
    color: "text-purple-500",
    bg: "bg-purple-100",
    description: "Operating license or business permit"
  },
  PERMIT: {
    icon: Receipt,
    label: "Permit",
    color: "text-amber-500",
    bg: "bg-amber-100",
    description: "Installation or construction permit"
  },
  TAX_CERTIFICATE: {
    icon: FileText,
    label: "Tax Certificate",
    color: "text-emerald-500",
    bg: "bg-emerald-100",
    description: "Tax compliance certificate"
  },
  OTHER: {
    icon: File,
    label: "Other",
    color: "text-gray-500",
    bg: "bg-gray-100",
    description: "Miscellaneous document"
  },
};

export function DocumentUpload({ onFilesChange, register }: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<UploadedFile | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentType>("OTHER");

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      console.warn("Rejected files:", rejectedFiles);
    }

    const newFiles = acceptedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substring(7),
      uploadStatus: "pending" as const,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Open type selection dialog for the first file
    if (newFiles.length > 0) {
      setPendingFile(newFiles[0]);
      setTypeDialogOpen(true);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'text/plain': ['.txt'],
    },
    maxSize: 10485760, // 10MB
    onDropRejected: (rejectedFiles) => {
      const newFiles = rejectedFiles.map((rejection) => {
        const file = rejection.file;
        return {
          ...file,
          id: Math.random().toString(36).substring(7),
          uploadStatus: "error" as const,
          errorMessage: rejection.errors[0]?.message || "Upload failed",
        };
      });
      setFiles(prev => [...prev, ...newFiles]);
    },
  });

  const handleTypeConfirm = () => {
    if (pendingFile) {
      setFiles(prev => 
        prev.map(f => 
          f.id === pendingFile.id 
            ? { ...f, documentType: selectedType, uploadStatus: "success" } 
            : f
        )
      );
      
      // Update parent component
      const updatedFiles = files.map(f => 
        f.id === pendingFile.id 
          ? { ...f, documentType: selectedType, uploadStatus: "success" }
          : f
      );
      onFilesChange(updatedFiles.map(f => ({ file: f, type: f.documentType || "OTHER" })));
      
      setTypeDialogOpen(false);
      setPendingFile(null);
      setSelectedType("OTHER");
    }
  };

  const handleTypeChange = (fileId: string, newType: DocumentType) => {
    setFiles(prev => 
      prev.map(f => 
        f.id === fileId ? { ...f, documentType: newType } : f
      )
    );
    
    // Update parent component
    const updatedFiles = files.map(f => 
      f.id === fileId ? { ...f, documentType: newType } : f
    );
    onFilesChange(updatedFiles.map(f => ({ file: f, type: f.documentType || "OTHER" })));
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updatedFiles = prev.filter(f => f.id !== id);
      onFilesChange(updatedFiles.map(f => ({ file: f, type: f.documentType || "OTHER" })));
      return updatedFiles;
    });
  };

  const getFileIcon = (file: UploadedFile) => {
    if (!file || !file.type) {
      return <File className="h-5 w-5 text-gray-500" />;
    }

    const fileType = file.type.toLowerCase();
    const fileName = file.name?.toLowerCase() || "";

    if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (fileType.includes('word') || fileName.includes('.doc')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    }
    if (fileType.includes('excel') || fileType.includes('spreadsheet') || fileName.includes('.xls')) {
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    }
    if (fileType.includes('image') || fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return <FileImage className="h-5 w-5 text-purple-500" />;
    }
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('archive')) {
      return <FileArchive className="h-5 w-5 text-amber-500" />;
    }
    if (fileType.includes('text') || fileName.endsWith('.txt')) {
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
    
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toUpperCase() || 'FILE';
  };

  return (
    <>
      <Card className="p-6 border-none shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              Documents
            </h2>
            <p className="text-muted-foreground ml-14">
              Upload station documents (permits, licenses, agreements, etc.)
            </p>
          </div>

          {/* Drag & Drop Zone */}
          <div
            {...getRootProps()}
            className={cn(
              "relative overflow-hidden rounded-xl border-2 border-dashed transition-all cursor-pointer",
              "hover:border-primary hover:bg-primary/5",
              isDragActive ? "border-primary bg-primary/10 scale-[1.02]" : "border-muted-foreground/25",
              "group"
            )}
          >
            <input {...getInputProps()} aria-label="File upload" />
            <div className="flex flex-col items-center text-center p-8">
              <div className={cn(
                "p-4 rounded-full bg-primary/10 mb-4 transition-transform group-hover:scale-110",
                isDragActive && "scale-110 bg-primary/20"
              )}>
                <Upload className={cn(
                  "h-8 w-8 transition-colors",
                  isDragActive ? "text-primary" : "text-primary/70"
                )} />
              </div>
              <p className="text-lg font-medium mb-2">
                {isDragActive ? "Drop files here" : "Drag & drop files here"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or <span className="text-primary font-medium">click to browse</span>
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary" className="text-xs">PDF</Badge>
                <Badge variant="secondary" className="text-xs">DOC</Badge>
                <Badge variant="secondary" className="text-xs">XLS</Badge>
                <Badge variant="secondary" className="text-xs">TXT</Badge>
                <Badge variant="secondary" className="text-xs">Images</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Max file size: 10MB
              </p>
            </div>
          </div>

          {/* Uploaded Files */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-lg">Uploaded Documents</h3>
                  <Badge variant="secondary" className="px-2">{files.length}</Badge>
                </div>
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
                  <TabsList className="grid grid-cols-2 w-[100px] h-8">
                    <TabsTrigger value="grid" className="px-2">
                      <Grid className="h-3.5 w-3.5" />
                    </TabsTrigger>
                    <TabsTrigger value="list" className="px-2">
                      <List className="h-3.5 w-3.5" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <ScrollArea className="h-[350px] pr-4">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {files.map((file) => {
                      const typeConfig = file.documentType 
                        ? documentTypeConfig[file.documentType] 
                        : null;
                      const TypeIcon = typeConfig?.icon || File;
                      
                      return (
                        <Card key={file.id} className="p-3 relative group hover:shadow-lg transition-all">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeFile(file.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          
                          <div className="flex flex-col items-center text-center">
                            <div className="p-4 rounded-xl bg-muted mb-3 relative">
                              {getFileIcon(file)}
                              <div className="absolute -top-2 -right-2">
                                {file.uploadStatus === "success" ? (
                                  <Badge className="h-5 w-5 p-0 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-3 w-3 text-white" />
                                  </Badge>
                                ) : file.uploadStatus === "error" ? (
                                  <Badge className="h-5 w-5 p-0 bg-red-500 rounded-full flex items-center justify-center">
                                    <AlertCircle className="h-3 w-3 text-white" />
                                  </Badge>
                                ) : (
                                  <Badge className="h-5 px-1 text-[8px] bg-blue-500">
                                    {getFileExtension(file.name)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-xs font-medium line-clamp-2 mb-1" title={file.name}>
                              {file.name}
                            </p>
                            
                            {/* Document Type Selector */}
                            <Select
                              value={file.documentType || "OTHER"}
                              onValueChange={(value: DocumentType) => handleTypeChange(file.id, value)}
                            >
                              <SelectTrigger className="h-7 text-xs mt-1">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(documentTypeConfig).map(([key, config]) => (
                                  <SelectItem key={key} value={key}>
                                    <div className="flex items-center gap-2">
                                      <config.icon className={cn("h-3 w-3", config.color)} />
                                      <span>{config.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                              <span>{formatFileSize(file.size)}</span>
                              {file.uploadStatus === "error" && file.errorMessage && (
                                <span className="text-red-500" title={file.errorMessage}>Error</span>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {files.map((file) => {
                      const typeConfig = file.documentType 
                        ? documentTypeConfig[file.documentType] 
                        : documentTypeConfig.OTHER;
                      const TypeIcon = typeConfig.icon;
                      
                      return (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-muted relative flex-shrink-0">
                              {getFileIcon(file)}
                              {file.uploadStatus === "error" && (
                                <div className="absolute -top-1 -right-1">
                                  <Badge className="h-4 w-4 p-0 bg-red-500 rounded-full flex items-center justify-center">
                                    <AlertCircle className="h-2 w-2 text-white" />
                                  </Badge>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <Badge variant="outline" className="text-[10px] h-5">
                                  {getFileExtension(file.name)}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                {/* Document Type Selector */}
                                <Select
                                  value={file.documentType || "OTHER"}
                                  onValueChange={(value: DocumentType) => handleTypeChange(file.id, value)}
                                >
                                  <SelectTrigger className="h-6 text-xs w-32">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(documentTypeConfig).map(([key, config]) => (
                                      <SelectItem key={key} value={key}>
                                        <div className="flex items-center gap-2">
                                          <config.icon className={cn("h-3 w-3", config.color)} />
                                          <span>{config.label}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                
                                <span>{formatFileSize(file.size)}</span>
                                <span>•</span>
                                <span>Added {format(new Date(), 'MMM dd, yyyy')}</span>
                                
                                {file.uploadStatus === "success" && (
                                  <>
                                    <span>•</span>
                                    <span className="text-green-600 flex items-center gap-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Uploaded
                                    </span>
                                  </>
                                )}
                                {file.uploadStatus === "error" && (
                                  <>
                                    <span>•</span>
                                    <span className="text-red-600 flex items-center gap-1">
                                      <AlertCircle className="h-3 w-3" />
                                      {file.errorMessage || "Upload failed"}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeFile(file.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Upload Summary */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                      <FileText className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Documents: {files.length}</p>
                      <p className="text-xs text-muted-foreground">
                        Total size: {formatFileSize(files.reduce((acc, f) => acc + (f.size || 0), 0))}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      files.forEach(f => URL.revokeObjectURL(f as any));
                      setFiles([]);
                      onFilesChange([]);
                    }}
                    className="border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900"
                  >
                    Clear all
                  </Button>
                </div>
              </div>

              {/* Document Type Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(documentTypeConfig).map(([key, config]) => {
                  const count = files.filter(f => f.documentType === key).length;
                  if (count === 0) return null;
                  
                  return (
                    <div key={key} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                      <div className={cn("p-1 rounded-lg", config.bg)}>
                        <config.icon className={cn("h-3 w-3", config.color)} />
                      </div>
                      <div>
                        <p className="text-xs font-medium">{config.label}</p>
                        <p className="text-xs text-muted-foreground">{count} files</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Success Stats */}
              {files.some(f => f.uploadStatus === "success") && (
                <div className="flex gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-950/50 p-2 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{files.filter(f => f.uploadStatus === "success").length} files uploaded successfully</span>
                </div>
              )}

              {/* Error Stats */}
              {files.some(f => f.uploadStatus === "error") && (
                <div className="flex gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/50 p-2 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span>{files.filter(f => f.uploadStatus === "error").length} files failed to upload</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Document Type Selection Dialog */}
      <Dialog open={typeDialogOpen} onOpenChange={setTypeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Document Type</DialogTitle>
            <DialogDescription>
              Choose the type of document you're uploading for {pendingFile?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-3">
              {Object.entries(documentTypeConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedType(key as DocumentType)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg border transition-all",
                      "hover:bg-muted/50",
                      selectedType === key && "border-primary bg-primary/5 ring-1 ring-primary"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg", config.bg)}>
                      <Icon className={cn("h-5 w-5", config.color)} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{config.label}</p>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                    {selectedType === key && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setTypeDialogOpen(false);
              setPendingFile(null);
              // Remove the pending file if cancelled
              if (pendingFile) {
                removeFile(pendingFile.id);
              }
            }}>
              Cancel
            </Button>
            <Button onClick={handleTypeConfirm}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}