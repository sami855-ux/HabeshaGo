"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewChargingStationSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-72" />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex h-12 items-center justify-center rounded-full bg-muted/50 p-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-6 py-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-16 hidden sm:block" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content Skeleton */}
        <Card className="p-8 border-none shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          {/* Basic Info Tab Skeleton */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-7 w-48" />
              </div>
              <Skeleton className="h-5 w-64 ml-14 mt-2" />
            </div>
            <Separator className="my-4" />

            <div className="grid gap-8">
              {/* Station Name Field */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-14 w-full" />
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-28 w-full" />
              </div>

              {/* Status and Verification Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>

              {/* Status Preview Skeleton */}
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
        </Card>

        {/* Footer Skeleton */}
        <div className="mt-8 flex justify-end gap-4">
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
    </div>
  );
}