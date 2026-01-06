"use client"

import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import HowWeWorks from "@/components/how-we-work"
import { Navigation } from "@/components/navigation"
import { ServicesSection } from "@/components/services-section"
import { TestimonialsSection } from "@/components/testimonials"

export default function Home() {
  return (
    <div className="">
      <Navigation />
      <HeroSection />
      <ServicesSection id="services" />
      <HowWeWorks id="how-we-work" />
      <TestimonialsSection id="testimonial" />
      <Footer />
    </div>
  )
}
