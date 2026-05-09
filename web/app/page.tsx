"use client"

import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { TestimonialsSection } from "@/components/testimonials"

import HowWeWorks from "@/components/how-we-work"

export default function Home() {
  return (
    <div>
      <Navigation />
      <HeroSection />
      <ServicesSection id="services" />
      <HowWeWorks id="how-we-work" />
      <TestimonialsSection id="testimonial" />
      <Footer />
    </div>
  )
}
