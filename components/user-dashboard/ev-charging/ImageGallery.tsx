"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react"
import { StationImage } from "@/types/ev"

interface ImageGalleryProps {
  images: StationImage[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images.length) {
    return (
      <Card className="h-48 bg-gray-100 flex items-center justify-center rounded-2xl">
        <div className="text-center text-gray-400">
          <ImageIcon className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">No images available</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="relative">
      <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100">
        <img
          src={images[currentIndex].url}
          alt={images[currentIndex].caption || "Station image"}
          className="w-full h-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white"
            onClick={() =>
              setCurrentIndex((i) => (i - 1 + images.length) % images.length)
            }
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white"
            onClick={() => setCurrentIndex((i) => (i + 1) % images.length)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentIndex ? "bg-white w-3" : "bg-white/60"
                }`}
                onClick={() => setCurrentIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
