"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Ticket,
  Smartphone,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Bus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppSelector } from "@/store/store"

interface HowWeWorksProps {
  id?: string
}

export default function HowWeWorks({ id }: HowWeWorksProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated, user } = useAppSelector((state) => state.user)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isAuth = mounted && isAuthenticated && !!user

  const steps = [
    {
      number: "01",
      title: "Search & Compare",
      subtitle: "Find the best coach & schedule",
      description:
        "Enter your departure and destination cities across Ethiopia. Instantly compare verified bus companies, departure times, VIP coach amenities, and live fares.",
      icon: <Search className="w-5 h-5" />,
      details: [
        "50+ Intercity & Express routes",
        "Compare coach amenities (WiFi, AC, USB)",
        "Direct schedules from 05:00 AM to 08:00 PM",
      ],
    },
    {
      number: "02",
      title: "Pick Your Seat",
      subtitle: "Real-time cabin layout map",
      description:
        "View the actual seat layout of your assigned coach. Choose your preferred window, aisle, or VIP front seat with 100% reservation certainty.",
      icon: <Ticket className="w-5 h-5" />,
      details: [
        "Live reserved vs available seat indicators",
        "Executive VIP vs Standard seating",
        "Select single or group seats together",
      ],
    },
    {
      number: "03",
      title: "1-Click Mobile Pay",
      subtitle: "Instant Telebirr & CBE Birr",
      description:
        "Pay securely in Ethiopian Birr via Telebirr, CBE Birr, Chapa, Amole, or your HabeshaGo Wallet. No terminal cash lines or change hassles.",
      icon: <Smartphone className="w-5 h-5" />,
      details: [
        "Automated SMS booking confirmation",
        "Instant transaction receipt with VAT",
        "Earn HabeshaGo reward miles per kilometer",
      ],
    },
    {
      number: "04",
      title: "Board & Track Live",
      subtitle: "Paperless QR & GPS tracker",
      description:
        "Simply present your digital QR boarding pass on your phone to the driver. Track your bus journey, current speed, and stop ETAs in real-time.",
      icon: <QrCode className="w-5 h-5" />,
      details: [
        "Contactless QR code scan at bus door",
        "Live satellite GPS location tracking",
        "1-click ticket sharing to family members",
      ],
    },
  ]

  return (
    <section id={id} className="relative py-20 sm:py-28 px-4 bg-background">
      <div className="max-w-5xl mx-auto">
        {/* Header Without Sparkles */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-orange-500 mb-2">
            How It Works
          </p>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            How HabeshaGo Works
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
            Booking your intercity bus in Ethiopia used to take hours of terminal queuing. With HabeshaGo, it takes less than 60 seconds from your phone.
          </p>
        </div>

        {/* Step Navigation Tabs - Clean, Borderless */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {steps.map((step, index) => {
            const isActive = activeStep === index
            return (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`p-4 sm:p-5 rounded-2xl text-left transition-all duration-300 relative ${
                  isActive
                    ? "bg-muted/70 text-foreground"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xl font-grotesk font-black ${
                      isActive ? "text-orange-500" : "text-muted-foreground/40"
                    }`}
                  >
                    {step.number}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isActive ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.icon}
                  </div>
                </div>

                <div className="text-sm sm:text-base font-bold text-foreground">
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {step.subtitle}
                </div>

                {isActive && (
                  <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-orange-500 rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* Active Step Detailed Showcase - Clean, Borderless */}
        <div className="rounded-3xl bg-muted/30 p-6 sm:p-10 mb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Left Column: Text & Features (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block">
                  STEP {steps[activeStep].number} OF 04
                </span>

                <h3 className="text-xl sm:text-2xl font-extrabold text-foreground">
                  {steps[activeStep].title} —{" "}
                  <span className="text-muted-foreground font-normal">
                    {steps[activeStep].subtitle}
                  </span>
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {steps[activeStep].description}
                </p>

                <div className="space-y-2 pt-2">
                  {steps[activeStep].details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <Button
                    asChild
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md shadow-orange-500/20"
                  >
                    <Link href={isAuth ? "/user/bus" : "/login"}>
                      <span>Book a Seat Now</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right Column: Visual Preview */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-muted/60 p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white mx-auto shadow-md shadow-orange-500/20 mb-3">
                    {steps[activeStep].icon}
                  </div>

                  <h4 className="text-base font-bold text-foreground mb-1">
                    {steps[activeStep].title}
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-4">
                    Designed for travelers and operators across Ethiopia.
                  </p>

                  <div className="p-3 rounded-xl bg-background text-xs text-left space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Service Status:</span>
                      <span className="text-emerald-500 font-semibold">Online 24/7</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Currency:</span>
                      <span className="font-bold text-foreground">ETB (Ethiopian Birr)</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bus Fleet Operator Partnership Banner - Clean, Borderless */}
        <div className="rounded-3xl bg-orange-500 p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider block mb-2 text-white/80">
              For Bus Companies &amp; Fleet Owners
            </span>

            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              Own a Bus Fleet or Minibus in Ethiopia?
            </h3>

            <p className="text-white/90 text-sm leading-relaxed mb-6">
              Digitize ticket sales, eliminate manual paper fraud, track your vehicles live on GPS, and receive direct automated payouts to your CBE or Telebirr merchant account.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-6 py-5 rounded-xl shadow-md transition-all"
              >
                <Link href="/login">
                  <span>Register Your Fleet</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-semibold px-6 py-5 rounded-xl"
              >
                <Link href="/login">
                  <span>Operator Login</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
