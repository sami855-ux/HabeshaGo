import { Badge } from "@/components/ui/badge"
import { Headset, Shield } from "lucide-react"

export function ShareHeader() {
  return (
    <div className="backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-muted-foreground">
              Ticket Sharing
            </p>
            <h1 className="text-2xl font-bold ">Share Your Ticket</h1>
            <p className="text-sm text-muted-foreground">
              Transfer your ticket to a friend or family member securely and
              instantly.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-2 px-3 py-1.5">
              <Headset className="size-4" />
              24/7 support
            </Badge>
            <Badge
              variant="outline"
              className="gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200"
            >
              <Shield className="size-4 text-orange-600" />
              Secure Transfer
            </Badge>
          </div>
        </header>
      </div>
    </div>
  )
}
