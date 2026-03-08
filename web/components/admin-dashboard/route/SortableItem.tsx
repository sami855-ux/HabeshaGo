// components/create-route/SortableItem.tsx
"use client"

import React, { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GripVertical, X, Move } from "lucide-react"
import { Midpoint } from "@/app/create-route/page"

interface SortableItemProps {
  id: string
  midpoint: Midpoint
  index: number
  onUpdateName: (id: string, name: string) => void
  onRemove: (id: string) => void
}

export function SortableItem({
  id,
  midpoint,
  index,
  onUpdateName,
  onRemove,
}: SortableItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState(midpoint.name)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleNameClick = () => {
    setIsEditing(true)
  }

  const handleNameBlur = () => {
    setIsEditing(false)
    if (tempName !== midpoint.name) {
      onUpdateName(midpoint.id, tempName)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false)
      if (tempName !== midpoint.name) {
        onUpdateName(midpoint.id, tempName)
      }
    }
    if (e.key === "Escape") {
      setIsEditing(false)
      setTempName(midpoint.name)
    }
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: isDragging ? 0.5 : 1,
        y: 0,
        scale: isDragging ? 1.02 : 1,
      }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.15 }}
      className={`relative ${isDragging ? "z-50" : "z-0"}`}
    >
      <div
        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
          isDragging
            ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 shadow-lg"
            : "bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200"
        }`}
      >
        {/* Drag Handle */}
        <div
          className={`cursor-grab active:cursor-grabbing ${
            isDragging ? "text-blue-600" : "text-gray-400 hover:text-gray-700"
          }`}
          {...attributes}
          {...listeners}
        >
          {isDragging ? (
            <Move className="h-5 w-5 animate-pulse" />
          ) : (
            <GripVertical className="h-4 w-4" />
          )}
        </div>

        {/* Order Badge */}
        <Badge
          variant="outline"
          className={`font-mono ${
            isDragging ? "bg-blue-100 border-blue-300" : ""
          }`}
        >
          {index + 1}
        </Badge>

        {/* Midpoint Info */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleKeyPress}
              autoFocus
              className="border-blue-300 focus:border-blue-500 focus:ring-blue-500 h-8 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              className="font-medium cursor-text hover:text-blue-600 transition-colors"
              onClick={handleNameClick}
              title="Click to edit name"
            >
              {midpoint.name}
            </div>
          )}
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            {midpoint.lat.toFixed(4)}, {midpoint.lng.toFixed(4)}
          </p>
        </div>

        {/* Remove Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(midpoint.id)}
          className={`h-8 w-8 ${
            isDragging
              ? "opacity-50"
              : "text-gray-400 hover:text-red-600 hover:bg-red-50"
          }`}
          disabled={isDragging}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Dragging Indicator */}
        {isDragging && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent rounded-lg" />
        )}
      </div>

      {/* Connection Line (except for last item) */}
      {index < midpoint.order && !isDragging && (
        <div className="h-2 w-px bg-blue-200 ml-5 relative">
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
        </div>
      )}
    </motion.div>
  )
}
