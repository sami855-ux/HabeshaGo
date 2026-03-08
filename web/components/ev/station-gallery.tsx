import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "./visually-hidden";
import { ChevronLeft, ChevronRight, ImageIcon, X } from "lucide-react";

interface StationGalleryProps {
  images: { id: number; url: string, caption: string }[];
  stationName: string;
}

export function StationGallery({ images, stationName }: StationGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <Card className="h-[300px] flex items-center justify-center bg-muted">
        <div className="text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No images available</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden p-0 shadow-none">
        {/* Main Image */}
        <div className="relative h-[300px] group">
          <Image
            src={images[0].url}
            alt={stationName}
            fill
            className="object-cover"
            priority
          />
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setSelectedImage(0)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setSelectedImage(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-1 p-1">
            {images.slice(0, 4).map((image, index) => (
              <div
                key={image.id}
                className="relative h-20 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image.url}
                  alt={`${stationName} - ${index + 1}`}
                  fill
                  className="object-cover rounded"
                />
                {index === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                    +{images.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Lightbox Dialog with Accessibility Fix */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {/* Add hidden title for accessibility */}
          <VisuallyHidden>
            <DialogTitle>Station Image Gallery</DialogTitle>
            <DialogDescription>
              Viewing images of {stationName}
            </DialogDescription>
          </VisuallyHidden>
          
          <div className="relative h-[600px]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {selectedImage !== null && (
              <>
                <Image
                  src={images[selectedImage].url}
                  alt={`${stationName} - Image ${selectedImage + 1}`}
                  fill
                  className="object-contain"
                />
                
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={() => setSelectedImage((selectedImage - 1 + images.length) % images.length)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={() => setSelectedImage((selectedImage + 1) % images.length)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}