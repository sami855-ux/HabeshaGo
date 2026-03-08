"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Gift,
  Trophy,
  Users,
  Gamepad2,
  Sparkles,
  Coins,
  PartyPopper,
  Star,
  Flame,
  Zap,
  Crown,
  Medal,
  Rocket,
  Target,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface PromoCarouselProps {
  className?: string
  autoPlayInterval?: number
  variant?: "default" | "compact" | "featured"
  showThumbnails?: boolean
}

interface PromoItem {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  cta: string
  gradient: string
  lightGradient: string
  accentColor: string
  badge?: string
  badgeVariant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
  image: string
  prize?: string
  metric?: string
  metricLabel?: string
}

export const promoItems: PromoItem[] = [
  {
    id: "1",
    icon: <Users className="w-6 h-6" />,
    title: "Travel Discoveries in Addis!",
    description: "Get ETB 100 off when you invite friends!",
    cta: "Invite Friends",
    gradient:
      "dark:from-violet-600 dark:via-purple-600 dark:to-pink-600 from-violet-500 via-purple-500 to-pink-500",
    lightGradient: "from-violet-50 to-pink-50",
    accentColor: "bg-purple-500",
    badge: "Limited",
    badgeVariant: "destructive",
    image:
      "https://images.unsplash.com/photo-1756723701257-46513cd36fc1?q=80&w=1031&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Addis lifestyle city photo :contentReference[oaicite:3]{index=3}
    prize: "ETB 100",
    metric: "1.2k",
    metricLabel: "Trips Shared",
  },
  {
    id: "2",
    icon: <Trophy className="w-6 h-6" />,
    title: "Weekly HabeshaGo Ride Challenge",
    description: "Win ETB 200 credits!",
    cta: "Join Now",
    gradient:
      "dark:from-blue-600 dark:via-cyan-600 dark:to-teal-600 from-blue-500 via-cyan-500 to-teal-500",
    lightGradient: "from-blue-50 to-cyan-50",
    accentColor: "bg-blue-500",
    image:
      "https://images.unsplash.com/photo-1662894312546-667d7698a1f7?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=2070&auto=format&fit=crop", // Ethiopian urban transport scene :contentReference[oaicite:4]{index=4}
    prize: "ETB 200",
    badge: "Popular",
    badgeVariant: "default",
    metric: "3k+",
    metricLabel: "Participants",
  },
  {
    id: "3",
    icon: <Crown className="w-6 h-6" />,
    title: "Meskel Holiday Special",
    description: "Top 50 get ETB 500 credits!",
    cta: "View Winners",
    gradient:
      "dark:from-emerald-600 dark:via-green-600 dark:to-teal-600 from-emerald-500 via-green-500 to-teal-500",
    lightGradient: "from-emerald-50 to-green-50",
    accentColor: "bg-emerald-500",
    badge: "Results",
    badgeVariant: "success",
    image:
      "https://images.unsplash.com/photo-1642505367898-cab7a3542cb3?q=80&w=1033&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=2070&auto=format&fit=crop", // Ethiopian festival vibe :contentReference[oaicite:5]{index=5}
    metric: "50",
    metricLabel: "Winners",
  },
  {
    id: "4",
    icon: <Gamepad2 className="w-6 h-6" />,
    title: "HabeshaGo Trivia Night",
    description: "Test your travel knowledge & win ETB 50",
    cta: "Play Now",
    gradient:
      "dark:from-rose-600 dark:via-pink-600 dark:to-fuchsia-600 from-rose-500 via-pink-500 to-fuchsia-500",
    lightGradient: "from-rose-50 to-pink-50",
    accentColor: "bg-rose-500",
    badge: "New",
    badgeVariant: "secondary",
    image:
      "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Ethiopian local fun scene :contentReference[oaicite:6]{index=6}
    prize: "ETB 50",
    metric: "500",
    metricLabel: "Players",
  },
  {
    id: "5",
    icon: <Rocket className="w-6 h-6" />,
    title: "Festive Travel Deals",
    description: "Get special discounts on buses & EV tickets!",
    cta: "Check Offers",
    gradient:
      "dark:from-amber-600 dark:via-orange-600 dark:to-red-600 from-amber-500 via-orange-500 to-red-500",
    lightGradient: "from-amber-50 to-orange-50",
    accentColor: "bg-amber-500",
    image:
      "https://images.unsplash.com/photo-1515476084989-0c8f073ea169?q=80&w=847&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Historic Ethiopian street view :contentReference[oaicite:7]{index=7}
    metric: "200+",
    metricLabel: "Users",
  },
  {
    id: "6",
    icon: <Target className="w-6 h-6" />,
    title: "Lucky Trip Draw",
    description: "Win ETB 100 for your next HabeshaGo ride!",
    cta: "Join Now",
    gradient:
      "dark:from-yellow-600 dark:via-amber-600 dark:to-orange-600 from-yellow-500 via-amber-500 to-orange-500",
    lightGradient: "from-yellow-50 to-amber-50",
    accentColor: "bg-yellow-500",
    badge: "Cash",
    badgeVariant: "warning",
    image:
      "https://images.unsplash.com/photo-1752119663529-b41ea2b1df84?q=80&w=872&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Addis Ababa market photo :contentReference[oaicite:8]{index=8}
    prize: "ETB 100",
    metric: "500",
    metricLabel: "Prizes",
  },
  {
    id: "7",
    icon: <Medal className="w-6 h-6" />,
    title: "Vote Best Ethiopian Destination",
    description: "Help choose top travel spots!",
    cta: "Vote Now",
    gradient:
      "dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 from-indigo-500 via-purple-500 to-pink-500",
    lightGradient: "from-indigo-50 to-purple-50",
    accentColor: "bg-indigo-500",
    badge: "Poll",
    badgeVariant: "secondary",
    image:
      "https://images.unsplash.com/photo-1573403092240-26095e118918?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Ethiopian landscape photo :contentReference[oaicite:9]{index=9}
    metric: "2.5k",
    metricLabel: "Votes",
  },
]

export function PromoCarousel({
  className,
  autoPlayInterval = 5000,
  variant = "default",
  showThumbnails = true,
}: PromoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [progress, setProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout>()

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % promoItems.length)
    setProgress(0)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentIndex(
      (prev) => (prev - 1 + promoItems.length) % promoItems.length,
    )
    setProgress(0)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setProgress(0)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 100)
  }

  // Progress animation
  useEffect(() => {
    if (isAutoPlaying && !isHovered) {
      const startTime = Date.now()
      const updateProgress = () => {
        const elapsed = Date.now() - startTime
        const newProgress = (elapsed / autoPlayInterval) * 100
        setProgress(Math.min(newProgress, 100))

        if (elapsed < autoPlayInterval) {
          progressIntervalRef.current = setTimeout(updateProgress, 16)
        }
      }

      progressIntervalRef.current = setTimeout(updateProgress, 16)

      return () => {
        if (progressIntervalRef.current) {
          clearTimeout(progressIntervalRef.current)
        }
      }
    }
  }, [currentIndex, isAutoPlaying, isHovered, autoPlayInterval])

  // Auto-play timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAutoPlaying && !isHovered) {
      interval = setInterval(nextSlide, autoPlayInterval)
    }
    return () => clearInterval(interval)
  }, [isAutoPlaying, isHovered, nextSlide, autoPlayInterval])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextSlide()
    }
    if (touchStart - touchEnd < -75) {
      prevSlide()
    }
  }

  const currentPromo = promoItems[currentIndex]

  if (variant === "compact") {
    return (
      <Card
        className={cn(
          "relative overflow-hidden border-0 shadow-none group cursor-pointer",
          className,
        )}
        onClick={() => console.log("CTA clicked:", currentPromo.cta)}
      >
        <div className="absolute inset-0">
          <Image
            src={currentPromo.image}
            alt={currentPromo.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 400px"
            priority
          />
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-r opacity-90",
              currentPromo.gradient,
            )}
          />
        </div>
        <CardContent className="relative p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 p-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white">
              {currentPromo.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-semibold text-white truncate">
                  {currentPromo.title}
                </h4>
                {currentPromo.badge && (
                  <Badge
                    variant={currentPromo.badgeVariant}
                    className="text-[10px] h-4 px-1.5 bg-white/20 text-white border-0"
                  >
                    {currentPromo.badge}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-white/80 mb-2">
                {currentPromo.description}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="h-7 text-xs bg-white text-gray-900 hover:bg-white/90"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  {currentPromo.cta}
                </Button>
                {currentPromo.prize && (
                  <span className="text-xs text-white/90 flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    {currentPromo.prize}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div ref={containerRef} className={cn("w-full bg-background", className)}>
      <div className="relative max-w-7xl px-0 py-1 md:py-2">
        {/* Header with Timer */}
        <div className="relative flex items-center justify-end mb-6">
          {/* Timer Indicator */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                Next in{" "}
                {Math.ceil(
                  (autoPlayInterval - (progress / 100) * autoPlayInterval) /
                    1000,
                )}
                s
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                className="rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                className="rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Card with Image */}
          <Card className="relative overflow-hidden border-0 shadow-xl group">
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={currentPromo.image}
                alt={currentPromo.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 1280px) 100vw, 1280px"
                priority
                quality={90}
              />
              <div className="absolute inset-0 bg-linear-to-r from-background via-background/25 to-background/50 dark:from-background dark:via-background/25 dark:to-background/50" />
              <div
                className={cn(
                  "absolute inset-0 bg-linear-to-r opacity-20 dark:opacity-30 mix-blend-overlay",
                  currentPromo.gradient,
                )}
              />
            </div>

            {/* Content */}
            <CardContent className="relative p-6 md:p-8 lg:p-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* Left Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-primary/10 backdrop-blur-sm text-primary">
                      {currentPromo.icon}
                    </div>
                    {currentPromo.badge && (
                      <Badge variant={currentPromo.badgeVariant}>
                        {currentPromo.badge}
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
                    {currentPromo.title}
                  </h3>

                  <p className="text-lg md:text-xl text-muted-foreground mb-6">
                    {currentPromo.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    <Button
                      size="lg"
                      className="hover:scale-105 transition-all duration-300 shadow-xl"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      {currentPromo.cta}
                    </Button>

                    {currentPromo.prize && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 backdrop-blur-sm">
                        <Gift className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-foreground">
                          {currentPromo.prize}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Content - Stats */}
                <div className="shrink-0">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border text-center">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {currentPromo.metric || "8"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {currentPromo.metricLabel || "Active"}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border text-center">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        24/7
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Support
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center justify-between mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {Math.ceil(
                  (autoPlayInterval - (progress / 100) * autoPlayInterval) /
                    1000,
                )}
                s
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Dots Navigation */}
        <div className="relative flex items-center justify-center gap-2 mt-6">
          {promoItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="group relative"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/20 group-hover:bg-muted-foreground/40",
                )}
              />
            </button>
          ))}
        </div>

        {/* Thumbnail Strip with Images */}
        {showThumbnails && (
          <div className="relative mt-6 overflow-hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-rounded">
              {promoItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "flex-shrink-0 relative w-32 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300",
                    index === currentIndex
                      ? "border-primary scale-105 shadow-lg"
                      : "border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent",
                      index === currentIndex ? "opacity-0" : "opacity-100",
                    )}
                  />
                  <div className="absolute bottom-1 left-1 right-1">
                    <p className="text-[10px] font-medium text-white truncate">
                      {item.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
