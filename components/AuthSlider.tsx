// components/auth/AuthSlider.tsx
import {
  Bus,
  Wallet,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Shield,
  CreditCard,
} from "lucide-react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1600&q=80",
    title: "Book buses across Ethiopia",
    subtitle: "Fast & reliable transport",
    description:
      "Search routes, compare schedules, and reserve your seat in seconds.",
    gradient: "from-amber-500/20 to-orange-600/20",
    accent: "amber-500",
  },
  {
    image:
      "https://images.unsplash.com/photo-1502920514313-52581002a659?w=1600&q=80",
    title: "Smart routes & schedules",
    subtitle: "Travel with confidence",
    description: "Live departure times, route details, and seat availability.",
    gradient: "from-blue-500/20 to-cyan-600/20",
    accent: "blue-500",
  },
  {
    image:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1600&q=80",
    title: "Secure wallet payments",
    subtitle: "Simple & trusted",
    description: "Top up once, pay instantly, and manage all your bookings.",
    gradient: "from-green-500/20 to-emerald-600/20",
    accent: "green-500",
  },
  {
    image:
      "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1600&q=80",
    title: "All your trips in one place",
    subtitle: "Easy management",
    description:
      "Tickets, history, notifications, and refunds—organized for you.",
    gradient: "from-purple-500/20 to-pink-600/20",
    accent: "purple-500",
  },
]

const FEATURES = [
  { icon: <Bus className="h-4 w-4" />, label: "Bus Booking", color: "amber" },
  { icon: <MapPin className="h-4 w-4" />, label: "Live Routes", color: "blue" },
  { icon: <Wallet className="h-4 w-4" />, label: "Wallet", color: "green" },
  { icon: <Shield className="h-4 w-4" />, label: "Secure", color: "purple" },
]

const STATS = [
  { value: "50K+", label: "Happy Customers", icon: Star },
  { value: "100+", label: "Daily Routes", icon: Clock },
  { value: "99.9%", label: "Safety Rate", icon: Shield },
  { value: "24/7", label: "Support", icon: CreditCard },
]

interface AuthSliderProps {
  autoPlayInterval?: number
}

export function AuthSlider({ autoPlayInterval = 6000 }: AuthSliderProps) {
  const [slideIndex, setSlideIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const nextSlide = () => {
    setDirection(1)
    setSlideIndex((p) => (p + 1) % SLIDES.length)
  }

  const prevSlide = () => {
    setDirection(-1)
    setSlideIndex((p) => (p === 0 ? SLIDES.length - 1 : p - 1))
  }

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(nextSlide, autoPlayInterval)
      return () => clearInterval(interval)
    }
  }, [autoPlayInterval, isHovered])

  const slide = SLIDES[slideIndex]

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.5,
      },
    }),
  }

  return (
    <div
      className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image with Parallax */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={slideIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover"
          />

          {/* Animated Gradient Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} mix-blend-overlay z-20`}
          />
        </motion.div>
      </AnimatePresence>

      {/* Modern Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-30" />

      {/* Animated Particles Effect */}
      <div className="absolute inset-0 z-40 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>

      {/* Modern Navigation Buttons */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="group relative w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-white group-hover:scale-110 transition-transform" />
          <span className="absolute -left-20 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black/80 backdrop-blur-xl rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Previous
          </span>
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="group relative w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-white group-hover:scale-110 transition-transform" />
          <span className="absolute -right-20 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black/80 backdrop-blur-xl rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Next
          </span>
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-40 p-16 flex flex-col justify-between w-full">
        {/* Enhanced Logo with Glass Effect */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/30">
              <Bus className="h-7 w-7 text-white" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-primary/50 to-transparent rounded-2xl blur-xl -z-10" />
          </div>
          <div>
            <span className="text-3xl font-bold text-white">HabeshaGo</span>
            <span className="block text-xs text-white/60 mt-1">
              Travel smarter
            </span>
          </div>
        </motion.div>

        {/* Text Content with Animations */}
        <div className="max-w-xl mt-auto mb-20">
          <motion.div
            key={slideIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Accent Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${slide.accent}/10 backdrop-blur-xl border border-white/10 mb-6`}
            >
              <div
                className={`w-2 h-2 rounded-full bg-${slide.accent} animate-pulse`}
              />
              <span className={`text-xs font-medium text-${slide.accent}`}>
                New Feature
              </span>
            </div>

            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              {slide.title}
            </h1>

            <p className="text-xl text-white/80 mb-3 font-light">
              {slide.subtitle}
            </p>

            <p className="text-white/60 text-lg leading-relaxed max-w-lg">
              {slide.description}
            </p>
          </motion.div>

          {/* Modern Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap gap-3 mt-8"
          >
            {FEATURES.map((f, i) => (
              <div key={i} className="group relative">
                <div className="flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-xl borde-none px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-default">
                  <span className={`text-${f.color}-400`}>{f.icon}</span>
                  <span>{f.label}</span>
                </div>
                <div
                  className={`absolute -inset-0.5 bg-gradient-to-r from-${f.color}-500/20 to-transparent rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity -z-10`}
                />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Enhanced Progress Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex items-center gap-4"
        >
          <div className="flex gap-3">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > slideIndex ? 1 : -1)
                  setSlideIndex(i)
                }}
                className="group relative"
              >
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    i === slideIndex
                      ? "w-12 bg-white"
                      : "w-2 bg-white/30 group-hover:bg-white/50"
                  }`}
                />
                {i === slideIndex && (
                  <div className="absolute -inset-1 bg-white/20 rounded-full blur-sm -z-10" />
                )}
              </button>
            ))}
          </div>

          {/* Current Slide Indicator */}
          <div className="text-xs text-white/40 font-mono">
            {String(slideIndex + 1).padStart(2, "0")} /{" "}
            {String(SLIDES.length).padStart(2, "0")}
          </div>
        </motion.div>
      </div>

      {/* Decorative Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent z-30" />
    </div>
  )
}
