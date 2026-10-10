"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Quote,
  Star,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Users,
  Award,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface TestimonialsSectionProps {
  id?: string
}

const TESTIMONIALS = [
  {
    id: 1,
    name: "Selamawit Hailu",
    role: "Frequent Weekend Traveler",
    route: "Addis Ababa ⇄ Hawassa",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Selamawit&backgroundColor=ffd700",
    quote:
      "Traveling to Hawassa every weekend used to mean standing at Meskel Square at 5:00 AM in the cold hoping for an open seat. With HabeshaGo, I reserve my favorite window seat on Thursday night, pay with Telebirr, and walk straight onto the bus. It's truly revolutionary.",
    rating: 5,
    tag: "Verified Passenger",
  },
  {
    id: 2,
    name: "Ato Dawit Tadesse",
    role: "Managing Director, Golden Coach Lines",
    route: "Northern Corridor Fleet",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dawit&backgroundColor=00b894",
    quote:
      "HabeshaGo gave our 18 intercity buses complete operational visibility. Real-time passenger manifests, live GPS vehicle tracking, and zero ticket fraud. Daily revenue settles directly to our CBE merchant account without manual reconciling.",
    rating: 5,
    tag: "Fleet Operator Partner",
  },
  {
    id: 3,
    name: "Bethelhem Girma",
    role: "Addis Ababa University Student",
    route: "Addis Express Commuter",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bethelhem&backgroundColor=fd79a8",
    quote:
      "The scheduled commuter pass is a blessing. No more battling aggressive crowds during morning rush hour at Megenagna. I scan my HabeshaGo QR code on the driver's phone, have a guaranteed seat, and arrive on time for lectures.",
    rating: 5,
    tag: "Student Commuter",
  },
  {
    id: 4,
    name: "Captain Yohannes Mengistu",
    role: "Senior Highway Coach Captain",
    route: "Addis ⇄ Bahir Dar Corridor",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yohannes&backgroundColor=0984e3",
    quote:
      "Checking paper tickets in the dark used to cause endless terminal delays. With the driver scanning app, each passenger boards in one second. The expressway speed and trip logging keep everyone accountable and safe.",
    rating: 5,
    tag: "Verified Driver",
  },
  {
    id: 5,
    name: "Ermias Assefa",
    role: "Business Consultant",
    route: "Addis Ababa ⇄ Dire Dawa",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ermias&backgroundColor=a29bfe",
    quote:
      "The ticket sharing feature is unmatched. I booked four seats for my team, transferred the passes straight to their phone numbers, and everyone received their individual SMS boarding passes in seconds. Clean, fast, and modern.",
    rating: 5,
    tag: "Business Traveler",
  },
]

export function TestimonialsSection({ id }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  }

  const stats = [
    { value: "250K+", label: "Happy Travelers", icon: Users, color: "text-orange-500" },
    { value: "4.9 / 5", label: "App & Web Rating", icon: Star, color: "text-amber-500" },
    { value: "99.4%", label: "On-Time Dispatch", icon: Clock, color: "text-yellow-500" },
    { value: "24/7", label: "Local Support in Amharic & English", icon: Award, color: "text-emerald-500" },
  ]

  const current = TESTIMONIALS[currentIndex]

  return (
    <section id={id} className="relative py-20 sm:py-28 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header Without Sparkles */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-orange-500 mb-2">
            Testimonials
          </p>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Loved by Travelers &amp; Bus Operators
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            Discover why daily commuters, travelers, and fleet managers trust HabeshaGo.
          </p>
        </div>

        {/* Testimonial Spotlight - Clean, Borderless */}
        <div className="rounded-3xl bg-muted/30 p-6 sm:p-12 mb-16 relative">
          <Quote className="absolute top-6 right-6 sm:top-10 sm:right-10 w-12 h-12 text-orange-500/10 pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Rating Stars & Tag */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <span className="text-xs font-semibold text-orange-500">
                  {current.tag}
                </span>
              </div>

              {/* Quote Text */}
              <p className="text-base sm:text-xl font-medium text-foreground leading-relaxed italic">
                &ldquo;{current.quote}&rdquo;
              </p>

              {/* User Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-border/40">
                <img
                  src={current.avatar}
                  alt={current.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-foreground">
                    {current.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {current.role} •{" "}
                    <span className="text-orange-500 font-medium">
                      {current.route}
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider Controls */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/40">
            <div className="flex items-center gap-1.5">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === idx
                      ? "w-6 bg-orange-500"
                      : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevTestimonial}
                className="w-8 h-8 rounded-full"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextTestimonial}
                className="w-8 h-8 rounded-full"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Clean, Borderless Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center py-6 border-y border-border/40">
          {stats.map((stat, index) => (
            <div key={index} className="p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
