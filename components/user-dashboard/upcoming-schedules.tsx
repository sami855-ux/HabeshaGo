"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bus,
  ParkingCircle,
  Zap,
  Clock,
  MapPin,
  Plus,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mockSchedules = [
  {
    id: "1",
    type: "bus",
    title: "Downtown Express",
    time: "3:30 PM",
    status: "now",
    countdown: "20 min",
  },
  {
    id: "2",
    type: "parking",
    title: "Premium Parking",
    time: "5:00 PM",
    status: "upcoming",
    countdown: "2h",
  },
  {
    id: "3",
    type: "ev",
    title: "Fast Charging",
    time: "9:00 AM",
    status: "tomorrow",
    countdown: "15h",
  },
  {
    id: "4",
    type: "bus",
    title: "City Link",
    time: "4:45 PM",
    status: "delayed",
    countdown: "+15",
  },
];

const fetchSchedules = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return mockSchedules;
};

// Group by status
const statusGroups = {
  now: { label: "Now", color: "bg-green-500" },
  upcoming: { label: "Upcoming", color: "bg-blue-500" },
  tomorrow: { label: "Tomorrow", color: "bg-purple-500" },
  delayed: { label: "Delayed", color: "bg-red-500" },
};

export default function UpcomingSchedules() {
  const { data: schedules, isLoading } = useQuery({
    queryKey: ["upcomingSchedules"],
    queryFn: fetchSchedules,
  });

  if (isLoading) {
    return (
      <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="space-y-4 py-7">
      <div className="flex justify-between items-center py-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-md bg-orange-50 dark:bg-orange-900/20">
              <Clock className="size-4 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Upcoming Schedules
            </h2>
            <Badge
              variant="outline"
              className="ml-2 rounded-full text-xs font-normal"
            >
              {schedules?.length} trips
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground ml-9">
            Your planned transportation activities for the next 24 hours
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-sm gap-1 text-muted-foreground hover:text-foreground"
        >
          View all
          <ChevronRight className="size-4" />
        </Button>
      </div>
      {/* Kanban header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pl-4">
        {Object.entries(statusGroups).map(([key, group]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full", group.color)} />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {group.label}
            </span>
            <Badge
              variant="outline"
              className="rounded-full text-[10px] px-1.5 h-4"
            >
              {schedules?.filter((s) => s.status === key).length || 0}
            </Badge>
          </div>
        ))}
      </div>

      {/* Horizontal scroll cards */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4">
        {schedules?.map((schedule) => {
          const Icon =
            schedule.type === "bus"
              ? Bus
              : schedule.type === "parking"
                ? ParkingCircle
                : Zap;
          const status =
            statusGroups[schedule.status as keyof typeof statusGroups];

          return (
            <div
              key={schedule.id}
              className="shrink-0 w-64 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 hover:border-gray-200 dark:hover:border-gray-700 transition-colors cursor-pointer group"
            >
              {/* Status bar */}
              <div className={cn("h-1 w-12 rounded-full mb-3", status.color)} />

              {/* Content */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center",
                        schedule.type === "bus" && "bg-amber-50 text-amber-600",
                        schedule.type === "parking" &&
                          "bg-blue-50 text-blue-600",
                        schedule.type === "ev" &&
                          "bg-emerald-50 text-emerald-600",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {schedule.title}
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400">
                    {schedule.countdown}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{schedule.time}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-full text-[10px] px-2"
                  >
                    {schedule.status}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add button */}
        <button className="shrink-0 w-64 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 p-4 flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <Plus className="h-4 w-4" />
          <span className="text-sm">New trip</span>
        </button>
      </div>
    </div>
  );
}
