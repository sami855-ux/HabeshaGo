"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImageGallery } from "./ImageGallery"
import { ChargingPointsGrid } from "./ChargingPointsGrid"
import { TariffSection } from "./TariffSection"
import { SmartCostCalculator } from "./SmartCostCalculator"
import { SmartRecommendationBanner } from "./SmartRecommendationBanner"
import { ChargingSessionSimulation } from "./ChargingSessionSimulation"
import { ChargingStation, ChargingPoint } from "@/types/ev"

interface StationDetailsSheetProps {
  station: ChargingStation | null
  onClose: () => void
}

export function StationDetailsSheet({
  station,
  onClose,
}: StationDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedChargingPoint, setSelectedChargingPoint] =
    useState<ChargingPoint | null>(null)

  if (!station) return null

  return (
    <Sheet open={!!station} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px] p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="text-xl">{station.name}</SheetTitle>
        </SheetHeader>

        <SmartRecommendationBanner station={station} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="px-6 border-b">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="charging">Charging</TabsTrigger>
              <TabsTrigger value="calculator">Calculator</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-6 space-y-6">
              <TabsContent value="overview" className="m-0 space-y-6">
                <ImageGallery images={station.images} />
                {/* <DocumentsSection documents={station.documents} /> */}
                <TariffSection tariffs={station.tariffs} />
              </TabsContent>

              <TabsContent value="charging" className="m-0 space-y-6">
                <ChargingPointsGrid
                  points={station.chargingPoints}
                  onSelectPoint={setSelectedChargingPoint}
                />
              </TabsContent>

              <TabsContent value="calculator" className="m-0">
                <SmartCostCalculator
                  station={station}
                  selectedPoint={selectedChargingPoint}
                />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        {selectedChargingPoint?.status === "AVAILABLE" && (
          <div className="border-t p-4 bg-gray-50">
            <ChargingSessionSimulation
              station={station}
              chargingPoint={selectedChargingPoint}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
