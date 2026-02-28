"use client";
import Image from "next/image";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Eye,
  Trash2,
  Grid,
  List,
  Star,
  Move,
  Camera,
  Info,
  ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ImageUploadProps {
  onFilesChange: (files: File[]) => void;
  register: any;
}

interface UploadedImage extends File {
  id: string;
  preview: string;
  uploadProgress?: number;
  uploadStatus?: "uploading" | "success" | "error";
  isFeatured?: boolean;
  caption?: string;
}

interface SortableImageProps {
  image: UploadedImage;
  onRemove: (id: string) => void;
  onSetFeatured: (id: string) => void;
  viewMode: "grid" | "list";
}

function SortableImage({ image, onRemove, onSetFeatured, viewMode }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const [imageError, setImageError] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (viewMode === "grid") {
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <Card className="p-0 relative group cursor-move">
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onSetFeatured(image.id);
              }}
            >
              <Star className={cn("h-3 w-3", image.isFeatured && "fill-yellow-400 text-yellow-400")} />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(image.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
            {!imageError ? (
              <Image
                src={image.preview}
                alt={image.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {image.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 text-[10px] h-5">
              <Star className="h-3 w-3 mr-1 fill-white" />
              Station
            </Badge>
          )}
          
        </Card>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-move">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {!imageError ? (
              <Image
                src={image.preview}
                alt={image.name}
                fill
                sizes="48px"
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            {image.isFeatured && (
              <Badge className="absolute -top-2 -right-2 bg-yellow-500 h-5 w-5 p-0 flex items-center justify-center">
                <Star className="h-3 w-3 fill-white" />
              </Badge>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{image.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(image.size)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onSetFeatured(image.id)}
          >
            <Star className={cn("h-4 w-4", image.isFeatured && "fill-yellow-400 text-yellow-400")} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => onRemove(image.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Move className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

export function ImageUpload({ onFilesChange, register }: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substring(7),
      preview: URL.createObjectURL(file),
      uploadStatus: "success" as const,
      isFeatured: images.length === 0 && file === acceptedFiles[0], // First image is featured by default
    }));
    
    setImages(prev => [...prev, ...newImages]);
    onFilesChange([...images, ...newImages]);
  }, [images, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
    },
    maxSize: 5242880, // 5MB
    maxFiles: 20,
  });

  const removeImage = (id: string) => {
    const imageToRemove = images.find(img => img.id === id);
    if (imageToRemove?.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    
    const updatedImages = images.filter(img => img.id !== id);
    
    // If featured image was removed, set the first image as featured
    if (imageToRemove?.isFeatured && updatedImages.length > 0) {
      updatedImages[0].isFeatured = true;
    }
    
    setImages(updatedImages);
    onFilesChange(updatedImages);
  };

  const setFeaturedImage = (id: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isFeatured: img.id === id,
    }));
    setImages(updatedImages);
    onFilesChange(updatedImages);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <Card className="p-6 border-none shadow-none">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Station Images</h2>
          <p className="text-sm text-muted-foreground">
            Upload images of the charging station (drag to reorder)
          </p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer",
            "hover:border-primary hover:bg-primary/5",
            isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center text-center">
            <div className="p-3 rounded-full bg-primary/10 mb-4">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium mb-1">
              {isDragActive ? "Drop images here" : "Drag & drop images here"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse from your computer
            </p>
            <p className="text-xs text-muted-foreground">
              Supported formats: JPG, PNG, GIF, WEBP (Max 5MB each, up to 20 images)
            </p>
          </div>
        </div>

        {/* Uploaded Images */}
        {images.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Uploaded Images</h3>
                <Badge variant="secondary">{images.length}</Badge>
              </div>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
                <TabsList className="grid grid-cols-2 w-[120px]">
                  <TabsTrigger value="grid">
                    <Grid className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <List className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={images.map(img => img.id)}
                  strategy={viewMode === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
                >
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {images.map((image) => (
                        <SortableImage
                          key={image.id}
                          image={image}
                          onRemove={removeImage}
                          onSetFeatured={setFeaturedImage}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {images.map((image) => (
                        <SortableImage
                          key={image.id}
                          image={image}
                          onRemove={removeImage}
                          onSetFeatured={setFeaturedImage}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>
                  )}
                </SortableContext>
              </DndContext>
            </ScrollArea>

            {/* Upload Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total Images: {images.length}</p>
                  <p className="text-xs text-muted-foreground">
                    Total size: {(images.reduce((acc, f) => acc + f.size, 0) / 1048576).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setImages([])}>
                    Clear all
                  </Button>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>
                  <strong>Pro tip:</strong> Drag images to reorder. The first image (marked with a star) will be used as the station's featured image.
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}