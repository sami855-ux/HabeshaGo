// components/charging-stations/documents-list.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "./visually-hidden";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  File,
  Download,
  Eye,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Grid,
  List,
  Filter,
  ExternalLink,
  Calendar,
  Hash,
  FileIcon,
  MoreVertical,
  ShieldCheck,
  ShieldOff,
  Clock,
  UserCheck,
  UserX,
  Verified,
  X,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface StationDocument {
  id: number;
  stationId: number;
  type: "INSURANCE" | "OWNERSHIP" | "LICENSE" | "PERMIT" | "TAX_CERTIFICATE" | "OTHER";
  url: string;
  verified: boolean;
  uploadedAt: string;
}

interface DocumentsListProps {
  documents: StationDocument[];
  onVerify?: (documentId: number, verified: boolean) => Promise<void>;
}

const documentTypeConfig = {
  INSURANCE: { 
    icon: Shield, 
    label: "Insurance", 
    color: "text-blue-500", 
    bg: "bg-blue-100",
    badge: "bg-blue-500",
    description: "Insurance certificate for the station"
  },
  OWNERSHIP: { 
    icon: FileText, 
    label: "Ownership", 
    color: "text-green-500", 
    bg: "bg-green-100",
    badge: "bg-green-500",
    description: "Proof of ownership or lease agreement"
  },
  LICENSE: { 
    icon: FileSpreadsheet, 
    label: "License", 
    color: "text-purple-500", 
    bg: "bg-purple-100",
    badge: "bg-purple-500",
    description: "Operating license or business permit"
  },
  PERMIT: { 
    icon: FileImage, 
    label: "Permit", 
    color: "text-amber-500", 
    bg: "bg-amber-100",
    badge: "bg-amber-500",
    description: "Installation or construction permit"
  },
  TAX_CERTIFICATE: { 
    icon: FileArchive, 
    label: "Tax Certificate", 
    color: "text-emerald-500", 
    bg: "bg-emerald-100",
    badge: "bg-emerald-500",
    description: "Tax compliance certificate"
  },
  OTHER: { 
    icon: File, 
    label: "Other", 
    color: "text-gray-500", 
    bg: "bg-gray-100",
    badge: "bg-gray-500",
    description: "Miscellaneous document"
  },
};

export function DocumentsList({ documents, onVerify }: DocumentsListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] = useState<StationDocument | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationDialog, setVerificationDialog] = useState<{
    open: boolean;
    document: StationDocument | null;
  }>({ open: false, document: null });

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const typeLabel = documentTypeConfig[doc.type].label.toLowerCase();
      const statusText = doc.verified ? 'verified' : 'unverified';
      if (!typeLabel.includes(searchLower) && !statusText.includes(searchLower)) {
        return false;
      }
    }
    
    // Type filter
    if (typeFilter !== "all" && doc.type !== typeFilter) {
      return false;
    }
    
    // Verified filter
    if (verifiedFilter === "verified" && !doc.verified) return false;
    if (verifiedFilter === "unverified" && doc.verified) return false;
    
    return true;
  });

  const handleVerifyToggle = async (document: StationDocument, verified: boolean) => {
    if (!onVerify) return;
    
    setIsVerifying(true);
    try {
      await onVerify(document.id, verified);
      
      setVerificationDialog({ open: false, document: null });
    } catch (error) {
    } finally {
      setIsVerifying(false);
    }
  };

  const getFileExtension = (url: string) => {
    return url.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const getDocumentIcon = (type: string) => {
    const config = documentTypeConfig[type as keyof typeof documentTypeConfig] || documentTypeConfig.OTHER;
    const Icon = config.icon;
    return <Icon className={cn("h-5 w-5", config.color)} />;
  };

  const previewDocument = (doc: StationDocument) => {
    setSelectedDocument(doc);
    setIsPreviewOpen(true);
  };

  if (documents.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Documents</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            This station doesn&rsquo;t have any documents yet. Documents will appear here once uploaded.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Station Documents
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage all station documents
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {documents.length} Document{documents.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <p className="text-xs text-muted-foreground">Total Documents</p>
            <p className="text-2xl font-bold">{documents.length}</p>
          </Card>
          <Card className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <p className="text-xs text-muted-foreground">Verified</p>
            <p className="text-2xl font-bold text-green-600">
              {documents.filter(d => d.verified).length}
            </p>
          </Card>
          <Card className="p-3 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {documents.filter(d => !d.verified).length}
            </p>
          </Card>
          <Card className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <p className="text-xs text-muted-foreground">Types</p>
            <p className="text-2xl font-bold">
              {new Set(documents.map(d => d.type)).size}
            </p>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1 max-w-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(documentTypeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <config.icon className={cn("h-4 w-4", config.color)} />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
              <TabsList className="grid grid-cols-2 w-[80px]">
                <TabsTrigger value="grid">
                  <Grid className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Documents Grid/List */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg font-medium">No matching documents</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((doc) => {
                  const config = documentTypeConfig[doc.type] || documentTypeConfig.OTHER;
                  const Icon = config.icon;
                  
                  return (
                    <Card key={doc.id} className="p-4 hover:shadow-lg transition-all group relative">
                      {/* Verification Status Badge */}
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className={cn(
                          doc.verified 
                            ? "bg-green-500 hover:bg-green-600" 
                            : "bg-yellow-500 hover:bg-yellow-600",
                          "text-white cursor-pointer"
                        )}
                        onClick={() => setVerificationDialog({ open: true, document: doc })}>
                          {doc.verified ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" /> Verified</>
                          ) : (
                            <><AlertCircle className="h-3 w-3 mr-1" /> Pending</>
                          )}
                        </Badge>
                      </div>

                      <div className="flex items-start gap-3 mb-3">
                        <div className={cn("p-3 rounded-lg", config.bg)}>
                          <Icon className={cn("h-6 w-6", config.color)} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{config.label}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {config.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Hash className="h-3 w-3" />
                          <span>ID: {doc.id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Uploaded {format(new Date(doc.uploadedAt), "MMM dd, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <FileIcon className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline" className="text-[10px]">
                            {getFileExtension(doc.url)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => previewDocument(doc)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        {onVerify && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Document Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setVerificationDialog({ open: true, document: doc })}
                                className={doc.verified ? "text-yellow-600" : "text-green-600"}
                              >
                                {doc.verified ? (
                                  <><ShieldOff className="h-4 w-4 mr-2" /> Unverify Document</>
                                ) : (
                                  <><ShieldCheck className="h-4 w-4 mr-2" /> Verify Document</>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((doc) => {
                  const config = documentTypeConfig[doc.type] || documentTypeConfig.OTHER;
                  const Icon = config.icon;
                  
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={cn("p-2 rounded-lg", config.bg)}>
                          <Icon className={cn("h-5 w-5", config.color)} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{config.label}</h3>
                            <Badge 
                              className={cn(
                                doc.verified ? "bg-green-500" : "bg-yellow-500",
                                "text-white text-[10px] h-5 cursor-pointer"
                              )}
                              onClick={() => setVerificationDialog({ open: true, document: doc })}
                            >
                              {doc.verified ? 'Verified' : 'Pending'}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {getFileExtension(doc.url)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              ID: {doc.id}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(doc.uploadedAt), "MMM dd, yyyy")}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => previewDocument(doc)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {onVerify && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setVerificationDialog({ open: true, document: doc })}
                            className={doc.verified ? "text-yellow-600" : "text-green-600"}
                          >
                            {doc.verified ? (
                              <ShieldOff className="h-4 w-4" />
                            ) : (
                              <ShieldCheck className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Results count */}
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredDocuments.length} of {documents.length} documents
        </div>
      </Card>

      {/* Document Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <VisuallyHidden>
            <DialogTitle>Document Preview</DialogTitle>
            <DialogDescription>
              Preview of {selectedDocument ? documentTypeConfig[selectedDocument.type].label : 'document'}
            </DialogDescription>
          </VisuallyHidden>
          
          {selectedDocument && (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    documentTypeConfig[selectedDocument.type].bg
                  )}>
                    {getDocumentIcon(selectedDocument.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {documentTypeConfig[selectedDocument.type].label}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Uploaded {format(new Date(selectedDocument.uploadedAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
                <Badge 
                  className={cn(
                    selectedDocument.verified ? "bg-green-500" : "bg-yellow-500",
                    "cursor-pointer"
                  )}
                  onClick={() => {
                    setIsPreviewOpen(false);
                    setVerificationDialog({ open: true, document: selectedDocument });
                  }}
                >
                  {selectedDocument.verified ? 'Verified' : 'Pending Verification'}
                </Badge>
              </div>
              
              <div className="flex-1 bg-muted rounded-lg overflow-hidden">
                <iframe 
                  src={selectedDocument.url} 
                  className="w-full h-full"
                  title={`Preview of ${documentTypeConfig[selectedDocument.type].label}`}
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => window.open(selectedDocument.url, '_blank')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog 
        open={verificationDialog.open} 
        onOpenChange={(open) => !open && setVerificationDialog({ open: false, document: null })}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {verificationDialog.document?.verified ? 'Unverify Document' : 'Verify Document'}
            </DialogTitle>
            <DialogDescription>
              {verificationDialog.document?.verified 
                ? 'Are you sure you want to unverify this document? It will no longer be marked as verified.'
                : 'Verify this document to confirm its authenticity and validity.'}
            </DialogDescription>
          </DialogHeader>

          {verificationDialog.document && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mb-4">
                <div className={cn(
                  "p-2 rounded-lg",
                  documentTypeConfig[verificationDialog.document.type].bg
                )}>
                  {getDocumentIcon(verificationDialog.document.type)}
                </div>
                <div>
                  <p className="font-medium">
                    {documentTypeConfig[verificationDialog.document.type].label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded {format(new Date(verificationDialog.document.uploadedAt), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {verificationDialog.document.verified ? (
                    <>
                      <ShieldCheck className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Currently Verified</p>
                        <p className="text-xs text-muted-foreground">This document is verified</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <ShieldOff className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">Pending Verification</p>
                        <p className="text-xs text-muted-foreground">This document needs review</p>
                      </div>
                    </>
                  )}
                </div>
                <Switch
                  checked={verificationDialog.document.verified}
                  onCheckedChange={(checked) => {
                    if (verificationDialog.document) {
                      handleVerifyToggle(verificationDialog.document, checked);
                    }
                  }}
                  disabled={isVerifying}
                />
              </div>

              {!verificationDialog.document.verified && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    Verifying this document will mark it as authentic and approved.
                  </p>
                </div>
              )}

              {verificationDialog.document.verified && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-700 flex items-center gap-1">
                    <UserX className="h-3 w-3" />
                    Unverifying will require the document to be reviewed again.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setVerificationDialog({ open: false, document: null })}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (verificationDialog.document) {
                  handleVerifyToggle(
                    verificationDialog.document, 
                    !verificationDialog.document.verified
                  );
                }
              }}
              disabled={isVerifying}
              className={cn(
                verificationDialog.document?.verified 
                  ? "bg-yellow-500 hover:bg-yellow-600" 
                  : "bg-green-500 hover:bg-green-600"
              )}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                verificationDialog.document?.verified ? 'Unverify' : 'Verify'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}