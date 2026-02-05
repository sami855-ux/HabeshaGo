// components/create-route/RouteForm.tsx
"use client"

import React from "react"
import { UseFormReturn } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  MeasuringStrategy,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MapPin,
  GripVertical,
  X,
  Trash2,
  RotateCcw,
  Save,
  Clock,
  DollarSign,
  Globe,
  Navigation,
  AlertCircle,
  Loader2,
  Route as RouteIcon,
  Move,
} from "lucide-react"
import {
  Midpoint,
  FormValues,
} from "@/app/(dashbaord)/admin/manage-route/add-new-route/page"
import { SortableItem } from "./SortableItem"

interface RouteFormProps {
  form: UseFormReturn<FormValues>
  midpoints: Midpoint[]
  totalDistance: number
  isLoading: boolean
  onRemoveMidpoint: (id: string) => void
  onUpdateMidpointName: (id: string, name: string) => void
  onReorderMidpoints: (newOrder: Midpoint[]) => void
  onClearAll: () => void
  onSubmit: (data: FormValues) => Promise<void>
  onReset: () => void
}

const RouteForm: React.FC<RouteFormProps> = ({
  form,
  midpoints,
  totalDistance,
  isLoading,
  onRemoveMidpoint,
  onUpdateMidpointName,
  onReorderMidpoints,
  onClearAll,
  onSubmit,
  onReset,
}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [activeItem, setActiveItem] = React.useState<Midpoint | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    const item = midpoints.find((mp) => mp.id === event.active.id)
    setActiveItem(item || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)
    setActiveItem(null)

    if (over && active.id !== over.id) {
      const oldIndex = midpoints.findIndex((mp) => mp.id === active.id)
      const newIndex = midpoints.findIndex((mp) => mp.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(midpoints, oldIndex, newIndex)
        // Update order numbers
        const updatedMidpoints = reordered.map((mp, index) => ({
          ...mp,
          order: index,
        }))
        onReorderMidpoints(updatedMidpoints)
      }
    }
  }

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  }

  return (
    <Card className="h-full shadow-none border-0 rounded-2xl bg-white/95 backdrop-blur-sm">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Route Name */}
            <FormField
              control={form.control}
              name="routeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Route Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Bole - Piazza Express"
                      className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for this route
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Origin & Destination */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Origin</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Starting point"
                        className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Destination</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="End point"
                        className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Distance & Time */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="distance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 flex items-center gap-2">
                      <Navigation className="h-4 w-4" />
                      Distance (km)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        readOnly
                        value={totalDistance}
                        className="rounded-xl border-gray-300 bg-gray-50"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription className="flex items-center gap-1">
                      <span>Auto-calculated</span>
                      <Badge variant="outline" className="ml-2">
                        {midpoints.length} points
                      </Badge>
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Est. Time (min)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30"
                        className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Price & Currency */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Price
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Currency
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ETB">
                          ETB - Ethiopian Birr
                        </SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Active Toggle */}
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-gray-700">
                      Active Status
                    </FormLabel>
                    <FormDescription>
                      Make this route immediately active in the system
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">
                    Description (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this route..."
                      className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional notes about stops, schedule, or special
                    instructions
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Midpoints Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FormLabel className="text-gray-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Midpoints
                    <Badge variant="secondary" className="ml-2">
                      {midpoints.length}
                    </Badge>
                  </FormLabel>
                  {midpoints.length > 1 && (
                    <Badge variant="outline" className="text-xs">
                      Drag to reorder
                    </Badge>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClearAll}
                  disabled={midpoints.length === 0}
                  className="rounded-lg"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>

              <ScrollArea className="h-64 rounded-xl border border-gray-200 p-2">
                {midpoints.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-gray-500 py-8"
                  >
                    <MapPin className="h-12 w-12 mb-2 opacity-50" />
                    <p className="text-sm">Click on the map to add midpoints</p>
                    <p className="text-xs mt-1">
                      Click anywhere within Addis Ababa
                    </p>
                  </motion.div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    measuring={{
                      droppable: {
                        strategy: MeasuringStrategy.Always,
                      },
                    }}
                  >
                    <SortableContext
                      items={midpoints.map((mp) => mp.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        <AnimatePresence>
                          {midpoints.map((midpoint) => (
                            <SortableItem
                              key={midpoint.id}
                              id={midpoint.id}
                              midpoint={midpoint}
                              index={midpoints.findIndex(
                                (mp) => mp.id === midpoint.id,
                              )}
                              onUpdateName={onUpdateMidpointName}
                              onRemove={onRemoveMidpoint}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </SortableContext>

                    <DragOverlay dropAnimation={dropAnimation}>
                      {activeItem && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-xl border border-blue-200">
                          <div className="flex items-center gap-2 flex-1">
                            <div className="cursor-grabbing">
                              <Move className="h-4 w-4 text-blue-600 animate-pulse" />
                            </div>
                            <Badge
                              variant="outline"
                              className="font-mono bg-blue-100"
                            >
                              {midpoints.findIndex(
                                (mp) => mp.id === activeItem.id,
                              ) + 1}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">
                                {activeItem.name}
                              </div>
                              <p className="text-xs text-gray-500 font-mono">
                                {activeItem.lat.toFixed(4)},{" "}
                                {activeItem.lng.toFixed(4)}
                              </p>
                            </div>
                          </div>
                          <div className="h-8 w-8 flex items-center justify-center">
                            <Move className="h-4 w-4 text-blue-400" />
                          </div>
                        </div>
                      )}
                    </DragOverlay>
                  </DndContext>
                )}
              </ScrollArea>

              <FormDescription className="flex items-center gap-2">
                <Move className="h-3 w-3" />
                Drag handles to reorder points. Order affects route calculation.
              </FormDescription>
            </div>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-4">
        <Separator />
        <div className="flex gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="flex-1 rounded-xl hover:bg-gray-100 transition-all"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading || midpoints.length < 2}
            className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Route
              </>
            )}
          </Button>
        </div>
        {midpoints.length < 2 && (
          <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 p-2 rounded-lg w-full">
            <AlertCircle className="h-4 w-4" />
            <span>Add at least 2 midpoints to save the route</span>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

export default RouteForm
