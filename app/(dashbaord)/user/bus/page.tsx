"use client";

import { BusList } from "@/components/bus/BusList";
import { SearchRoute } from "@/components/bus/SearchRoute";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Bus, Shield, Zap } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { searchBusesThunk } from "@/store/slices/bus.Slice";
import { useEffect } from "react";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { loading, buses } = useAppSelector((state) => state.bus);

  // Optional: Fetch all buses on mount
  useEffect(() => {
    dispatch(searchBusesThunk({ start: "", end: "" }));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background rounded-2xl">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Bus Booking
            </h1>
            <p className="text-muted-foreground mt-2">
              Find, book, and manage your bus journeys effortlessly
            </p>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SearchRoute />
        </motion.div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {/* Bus List */}
        {!loading && buses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Available Buses</h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="size-4 text-green-500" />
                  <Button
                    onClick={() => router.push(`/user/route/${route.id}`)}
                  >
                    Track Route
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="size-4 text-blue-500" />
                  <span>Verified Operators</span>
                </div>
              </div>
            </div>

            <BusList />
          </motion.div>
        )}

        {/* Empty */}
        {!loading && buses.length === 0 && (
          <div className="text-center py-12">
            <Bus className="size-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold mt-4">No buses found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search filters
            </p>
          </div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-border"
        >
          <Feature
            icon={<Zap className="size-6 text-primary-foreground" />}
            title="Instant Booking"
            text="Book tickets in under 60 seconds"
          />
          <Feature
            icon={<Bus className="size-6 text-secondary-foreground" />}
            title="Live Tracking"
            text="Real-time bus location updates"
          />
          <Feature
            icon={<Shield className="size-6 text-accent-foreground" />}
            title="Safe Travel"
            text="Verified drivers & safety features"
          />
        </motion.div>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }: any) {
  return (
    <div className="text-center p-4">
      <div className="size-12 rounded-lg flex items-center justify-center mx-auto mb-3 bg-gradient-to-br from-primary to-primary/80">
        {icon}
      </div>
      <h4 className="font-bold">{title}</h4>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
