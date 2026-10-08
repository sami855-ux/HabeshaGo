"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Ticket,
  Navigation,
  QrCode,
  Smartphone,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { useAppSelector } from "@/store/store"

interface ServicesSectionProps {
  id?: string
}

export function ServicesSection({ id }: ServicesSectionProps) {
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated, user } = useAppSelector((state) => state.user)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isAuth = mounted && isAuthenticated && !!user
  const coreFeatures = [
    {
      title: "Instant Seat Selection",
      description:
        "Explore real-time coach cabin maps and choose your preferred window or aisle seat before paying.",
      icon: <Ticket className="w-5 h-5 text-orange-500" />,
    },
    {
      title: "Live GPS Bus Tracking",
      description:
        "Track your coach on the map in real-time with satellite positioning, checkpoints, and arrival times.",
      icon: <Navigation className="w-5 h-5 text-orange-500" />,
    },
    {
      title: "Digital QR Boarding Pass",
      description:
        "Paperless travel directly on your smartphone. Drivers scan your dynamic QR pass for 1-second boarding.",
      icon: <QrCode className="w-5 h-5 text-orange-500" />,
    },
    {
      title: "Telebirr & CBE Birr Pay",
      description:
        "Instant cashless booking in Ethiopian Birr via Telebirr, CBE Birr, Chapa, or Safaricom M-Pesa.",
      icon: <Smartphone className="w-5 h-5 text-orange-500" />,
    },
  ]

  const stats = [
    { value: "50+", label: "Connected Cities" },
    { value: "120+", label: "Verified Coaches" },
    { value: "250K+", label: "Passenger Trips" },
    { value: "99.4%", label: "On-Time Departures" },
  ]

  return (
    <section id={id} className="relative py-12 sm:py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <p className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-1.5">
            Modern Transit Platform
          </p>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Built for Ethiopia&apos;s{" "}
            <span className="text-orange-500">
              Next-Generation
            </span>{" "}
            Travelers
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Everything you need for seamless intercity bus journeys across Ethiopia.
          </p>
        </div>

        {/* Small, Compact 4 Cards - No Bullet Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {coreFeatures.map((feature, index) => (
            <div
              key={index}
              className="p-4 sm:p-5 rounded-md bg-gray-50 hover:bg-gray-100/80 border border-gray-100 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Small Compact Icon */}
                <div className="w-9 h-9 rounded-md bg-orange-100/70 flex items-center justify-center mb-3">
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  {feature.description}
                </p>
              </div>

              <Link
                href={isAuth ? "/user/bus" : "/login"}
                className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors pt-1"
              >
                <span>Book now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* Small, Clean Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-100 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-0.5">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
