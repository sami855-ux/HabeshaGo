"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Image as ImageIcon, X } from "lucide-react"
import { StationImage } from "@/types/ev"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ImageGalleryProps {
  images: StationImage[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  )

  if (!images.length) {
    return (
      <Card className="h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-2xl">
        <div className="text-center text-gray-400">
          <ImageIcon className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">No images available</p>
        </div>
      </Card>
    )
  }

  // Get height classes based on position and image count
  const getImageHeight = (index: number) => {
    const count = images.length

    // For 3 images - first image taller
    if (count === 3 && index === 0) {
      return "h-80"
    }
    if (count === 3 && index !== 0) {
      return "h-[152px]"
    }

    // For 4 images - all equal height
    if (count === 4) {
      return "h-40"
    }

    // For 5+ images - first image taller
    if (count >= 5 && index === 0) {
      return "h-64"
    }
    if (count >= 5 && index !== 0) {
      return "h-[120px]"
    }

    // Default
    return "h-48"
  }

  // Get grid column span
  const getGridSpan = (index: number) => {
    const count = images.length

    // First image spans 2 columns when there are 3 images
    if (count === 3 && index === 0) {
      return "col-span-2"
    }

    // First image spans 2 columns when there are 5+ images
    if (count >= 5 && index === 0) {
      return "md:col-span-2"
    }

    return ""
  }

  // Determine grid columns
  const getGridCols = () => {
    const count = images.length

    if (count === 1) return "grid-cols-1"
    if (count === 2) return "grid-cols-2"
    if (count === 3) return "grid-cols-2"
    if (count >= 4) return "grid-cols-2 md:grid-cols-4"

    return "grid-cols-2"
  }

  return (
    <>
      {/* Grid Gallery */}
      <div className={`grid ${getGridCols()} gap-2`}>
        {images.slice(0, 6).map((image, index) => {
          const isLastVisible = index === 5 && images.length > 6
          const heightClass = getImageHeight(index)
          const spanClass = getGridSpan(index)

          return (
            <div
              key={image.id}
              className={`relative overflow-hidden rounded-xl cursor-pointer group ${spanClass} ${heightClass}`}
              onClick={() => setSelectedImageIndex(index)}
            >
              <Image
                src={image.url}
                alt={image.caption || `Station image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Image count indicator for last visible */}
              {isLastVisible && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center text-white">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-sm font-medium">
                      +{images.length - 5} more
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Fullscreen Lightbox Dialog */}
      <Dialog
        open={selectedImageIndex !== null}
        onOpenChange={() => setSelectedImageIndex(null)}
      >
        <DialogContent className="!max-w-none w-[95%] h-[95%] p-0 bg-black/95 border-none rounded-lg m-0">
          {selectedImageIndex !== null && (
            <div className="relative h-full w-full flex items-center justify-center">
              {/* Main Image */}
              <div className="relative w-full h-full">
                <Image
                  src={images[selectedImageIndex].url}
                  alt={images[selectedImageIndex].caption || "Station image"}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>

              {/* Caption */}
              {images[selectedImageIndex].caption && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 z-10">
                  <p className="text-sm text-white">
                    {images[selectedImageIndex].caption}
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white w-12 h-12 z-10"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImageIndex(
                        (prev) => (prev! - 1 + images.length) % images.length,
                      )
                    }}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white w-12 h-12 z-10"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImageIndex(
                        (prev) => (prev! + 1) % images.length,
                      )
                    }}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>

                  {/* Image Counter */}
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 z-10">
                    <span className="text-sm text-white font-medium">
                      {selectedImageIndex + 1} / {images.length}
                    </span>
                  </div>
                </>
              )}

              {/* Close Button */}
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 left-4 rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white w-12 h-12 z-10"
                onClick={() => setSelectedImageIndex(null)}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
