"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import {
  Navigation,
  HeroSection,
  PaymentPartnersSection,
  ServicesSection,
  InteractivePreviewSection,
  HowWeWorks,
  TestimonialsSection,
  FAQSection,
  Footer,
} from "@/components/landing"

export default function Home() {
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme("light")
  }, [setTheme])

  return (
    <main className="min-h-screen bg-white text-gray-900 antialiased selection:bg-orange-500 selection:text-white">
      <Navigation />
      <HeroSection />
      <PaymentPartnersSection />
      <ServicesSection id="features" />
      <InteractivePreviewSection id="digital-pass" />
      <HowWeWorks id="how-we-work" />
      <TestimonialsSection id="testimonials" />
      <FAQSection id="faq" />
      <Footer />
    </main>
  )
}
