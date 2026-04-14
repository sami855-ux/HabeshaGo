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
    <section className="relative w-full min-h-screen overflow-hidden pt-16">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-yellow-500/10" />

      {/* Floating Particles (SSR SAFE) */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((p, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-orange-500/30 rounded-full"
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
        className="relative z-10 h-screen flex flex-col justify-center items-center text-center px-6 max-w-6xl mx-auto"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <span className="text-sm font-medium text-white/90 font-jakarta">
              Revolutionizing Addis Abeba's Mobility
            </span>
          </div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4"
        >
          <span className="bg-gradient-to-r from-white via-orange-100 to-yellow-100 bg-clip-text text-transparent font-grotesk">
            Smarter Journeys for
          </span>
          <br />
          <motion.span
            className="bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent"
            animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200%" }}
          >
            a Connected Ethiopia.
          </motion.span>
        </motion.h1>

        {/* Rotating Text */}
        <motion.div variants={itemVariants} className="h-12 mb-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={textIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-lg md:text-xl lg:text-2xl text-white/90 font-jakarta"
            >
              {texts[textIndex]}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Features */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-2xl"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.text}
              custom={i}
              variants={featureVariants}
              className="flex flex-col items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-xs border-none"
            >
              <span className="text-sm text-white/80">{f.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div variants={itemVariants} className="flex gap-5 flex-wrap">
          <Link href="/login">
            <Button className="px-16 w-38 py-6 text-lg rounded-xl  bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
              Join Us <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>

          <Link href="/learn-more">
            <Button
              variant="outline"
              className="px-12 py-6 text-lg rounded-2xl text-white border-white/30 bg-white/5"
            >
              Learn More
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
