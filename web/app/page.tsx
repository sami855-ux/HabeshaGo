"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { PaymentPartnersSection } from "@/components/payment-partners"
import { ServicesSection } from "@/components/services-section"
import { InteractivePreviewSection } from "@/components/interactive-preview"
import HowWeWorks from "@/components/how-we-work"
import { TestimonialsSection } from "@/components/testimonials"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"

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
