"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Send, ThumbsUp, Award, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface RatingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { score: number; comment: string }) => Promise<void> | void
  busDetails?: {
    busNumber?: string
    routeName?: string
    date?: string
  }
  isLoading?: boolean
  title?: string
  description?: string
}

const ratingLabels = {
  1: "Poor - Needs improvement",
  2: "Fair - Could be better",
  3: "Good - Satisfactory",
  4: "Very Good - Impressed",
  5: "Excellent - Amazing experience!",
}

const ratingEmojis = {
  1: "😞",
  2: "😐",
  3: "🙂",
  4: "😊",
  5: "🤩",
}

export const RatingDialog = ({
  open,
  onOpenChange,
  onSubmit,
  busDetails,
  isLoading = false,
  title = "Rate Your Journey",
  description = "Your feedback helps us improve and provide better service for everyone.",
}: RatingDialogProps) => {
  const [score, setScore] = useState(0)
  const [comment, setComment] = useState("")
  const [hoveredScore, setHoveredScore] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      // Delay reset to avoid visual flash
      const timer = setTimeout(() => {
        setScore(0)
        setComment("")
        setHoveredScore(0)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [open])

  const handleSubmit = async () => {
    if (score === 0) {
      toast.error("Please select a rating", {
        description: "Tap on the stars to rate your experience",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({ score, comment })
      toast.success("Thank you for your feedback!", {
        description: "Your rating has been submitted successfully.",
        icon: <ThumbsUp className="w-4 h-4" />,
      })
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to submit rating", {
        description: "Please try again later.",
      })
      console.error("Rating submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  const selectedLabel = ratingLabels[score as keyof typeof ratingLabels]
  const selectedEmoji = ratingEmojis[score as keyof typeof ratingEmojis]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
        {/* Orange gradient header */}
        <div className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-6 pt-2 pb-6">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

          <DialogHeader className="relative z-10">
            <div className="flex items-center justify-center mb-1">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-bold text-white">
              {title}
            </DialogTitle>
            <DialogDescription className="text-center text-orange-100 mt-2">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Bus details summary */}
        {busDetails && (busDetails.busNumber || busDetails.routeName) && (
          <div className="px-6 pt-4 pb-2 bg-orange-50 dark:bg-orange-950/20 border-b border-orange-100 dark:border-orange-900">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-orange-400 rounded-full" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Journey
                  </p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {busDetails.routeName || "Bus Journey"}
                  </p>
                </div>
              </div>
              {busDetails.busNumber && (
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Bus
                  </p>
                  <p className="font-mono font-medium text-gray-900 dark:text-gray-100">
                    {busDetails.busNumber}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-5 py-6 px-6">
          {/* Rating prompt with emoji */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium mb-3">
              Your opinion matters
            </div>

            <p className="text-sm text-muted-foreground">
              How was your experience?
            </p>
          </div>

          {/* Stars with animation */}
          <div className="flex justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setScore(star)}
                onMouseEnter={() => setHoveredScore(star)}
                onMouseLeave={() => setHoveredScore(0)}
                className="group relative focus:outline-none transition-transform hover:scale-110 active:scale-95"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={cn(
                    "w-8 h-8 transition-all duration-200",
                    star <= (hoveredScore || score)
                      ? "fill-orange-400 text-orange-400 drop-shadow-lg"
                      : "text-gray-300 dark:text-gray-600 hover:text-orange-300",
                    score === star && "animate-pulse",
                  )}
                />
                {score === star && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Rating label */}
          {selectedLabel && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30">
                <span className="text-xl">{selectedEmoji}</span>
                <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
                  {selectedLabel}
                </span>
              </div>
            </div>
          )}

          {/* Comment section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <span>Share more details</span>
              <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <Textarea
              placeholder="What did you like? Any suggestions for improvement?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[70px] resize-none border-gray-200 dark:border-gray-700 focus:border-orange-400 focus:ring-orange-400 transition-all"
              maxLength={500}
              disabled={isSubmitting || isLoading}
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Your feedback helps us improve</span>
              <span>{comment.length}/500</span>
            </div>
          </div>

          {/* Submit button */}
          <Button
            className={cn(
              "w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-6 transition-all duration-200 shadow-lg hover:shadow-xl",
              (score === 0 || isSubmitting || isLoading) &&
                "opacity-50 cursor-not-allowed",
            )}
            disabled={score === 0 || isSubmitting || isLoading}
            onClick={handleSubmit}
          >
            {isSubmitting || isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Rating
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// API-ready submission hook
export const useRatingSubmission = () => {
  const [isLoading, setIsLoading] = useState(false)

  const submitRating = async (data: {
    score: number
    comment: string
    bookingId?: string
    busId?: number
    scheduleId?: number
  }) => {
    setIsLoading(true)

    try {
      // API endpoint - replace with your actual endpoint
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: data.score,
          comment: data.comment,
          bookingId: data.bookingId,
          busId: data.busId,
          scheduleId: data.scheduleId,
          createdAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit rating")
      }

      const result = await response.json()
      return result
    } finally {
      setIsLoading(false)
    }
  }

  return { submitRating, isLoading }
}
