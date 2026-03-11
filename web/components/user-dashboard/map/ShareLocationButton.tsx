"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Check, Copy } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { useUserLocation } from "@/hooks/useUserLocation"
import { useQueryParams } from "@/hooks/useQueryParams"
import { toast } from "sonner"
import { usePathname } from "next/navigation"

export default function ShareLocationButton() {
  const pathname = usePathname()

  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { userLocation } = useUserLocation()
  const { getParam } = useQueryParams()

  const getShareableLink = () => {
    const lat = getParam("lat") || userLocation?.lat
    const lng = getParam("lng") || userLocation?.lng

    if (typeof window === "undefined") return ""

    const origin = window.location.origin

    if (lat && lng) {
      return `${origin}${pathname}?lat=${lat}&lng=${lng}`
    }

    return `${origin}${pathname}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareableLink())
      setCopied(true)
      toast.success("Share this link to show your location on the map.")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy", {
        description: "Please try again or copy manually.",
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="lg" className="rounded-full shadow-lg">
          <Share2 className="h-5 w-5 mr-2" />
          Share Location
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Share Location</SheetTitle>
          <SheetDescription>
            Share this link to show your current location on the map.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <Input value={getShareableLink()} readOnly className="flex-1" />
            <Button onClick={copyToClipboard} size="icon">
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Anyone with this link can see the location you&apos;re sharing.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
