"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Battery,
  ChevronRight,
  Gauge,
  ShieldCheck,
  TreePine,
  Route,
} from "lucide-react"
import { useEffect, useState } from "react"

type Particle = {
  left: number
  top: number
  xStart: number
  xEnd: number
  duration: number
}

export function HeroSection() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 100])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  const [textIndex, setTextIndex] = useState(0)
  const texts = [
    "Seamless Urban Mobility Solutions",
    "Your Smart City Journey Starts Here",
    "Redefining Urban Transportation",
    "Drive. Park. Charge. Ride, All in One",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const [mounted, setMounted] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    setMounted(true)

    const generatedParticles: Particle[] = Array.from({ length: 20 }).map(
      () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        xStart: Math.random() * 100,
        xEnd: Math.random() * 200,
        duration: Math.random() * 10 + 10,
      }),
    )

    setParticles(generatedParticles)
  }, [])

  /* ---------------- ANIMATIONS ---------------- */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const featureVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  }

  const features = [
    { icon: Gauge, text: "Lightning Charge", color: "text-yellow-500" },
    { icon: ShieldCheck, text: "Safe & Secure", color: "text-blue-500" },
    { icon: TreePine, text: "Zero Emissions", color: "text-green-500" },
    { icon: Route, text: "AI Navigation", color: "text-purple-500" },
  ]

  return (
    <section className="relative w-full min-h-[100dvh] overflow-hidden pt-16 md:pt-20 lg:pt-28 pb-4 ">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-yellow-500/10" />

      {/* Floating Particles (SSR SAFE) */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((p, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 bg-orange-500/30 rounded-full"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
              }}
              initial={{ y: -100, x: p.xStart }}
              animate={{
                y: ["0vh", "100vh"],
                x: [p.xStart, p.xEnd],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}

      {/* Background Image */}
      <motion.div
        style={{ y, backgroundImage: "url('/bg.png')" }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] lg:h-[calc(100vh-6rem)] flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-4 sm:mb-6 md:mb-8">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <span className="text-xs sm:text-sm font-medium text-white/90 font-jakarta whitespace-nowrap">
              Revolutionizing Addis Abeba's Mobility
            </span>
          </div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-3 sm:mb-4 md:mb-6 px-2"
        >
          <span className="bg-gradient-to-r from-white via-orange-100 to-yellow-100 bg-clip-text text-transparent font-grotesk block sm:inline">
            Smarter Journeys for
          </span>
          <br className="hidden sm:block" />
          <motion.span
            className="bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent inline-block mt-1 sm:mt-0"
            animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200%" }}
          >
            a Connected Ethiopia.
          </motion.span>
        </motion.h1>

        {/* Rotating Text */}
        <motion.div
          variants={itemVariants}
          className="h-10 sm:h-12 md:h-14 mb-6 sm:mb-8 md:mb-10"
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={textIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 font-jakarta px-4"
            >
              {texts[textIndex]}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Features */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto w-full px-2"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.text}
              custom={i}
              variants={featureVariants}
              className="flex flex-col items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <f.icon
                className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${f.color} mb-1`}
              />
              <span className="text-xs sm:text-sm text-white/80 font-medium whitespace-nowrap">
                {f.text}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex gap-3 sm:gap-4 md:gap-5 flex-wrap justify-center px-4"
        >
          <Link href="/login" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto px-6 sm:px-12 md:px-16 py-3 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300">
              Join Us{" "}
              <ChevronRight className="ml-1 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </Link>

          <Link href="/learn-more" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto px-6 sm:px-10 md:px-12 py-3 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg rounded-xl text-white border-white/30 bg-white/5 hover:bg-white/10 hover:border-white/50 transition-all duration-300 border-none"
            >
              Learn More
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
