"use client"

import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import HowWeWorks from "@/components/how-we-work"
import { Navigation } from "@/components/navigation"
import { ServicesSection } from "@/components/services-section"
import { TestimonialsSection } from "@/components/testimonials"
import { ThemeToggle } from "@/components/themeToggle"
// import { useAuth } from "@/hooks/useAuth"
// import { authClient } from "@/lib/auth-client"

export default function Home() {
  // const { user, loading } = useAuth()

  // if (loading) {
  //   return <div className="">loading.....</div>
  // }

  // if (user) {
  //   return <div className="">There is session {user.email}</div>
  // }

  return (
    <div className="">
      <ThemeToggle />
      <Navigation />
      <HeroSection />
      <ServicesSection id="services" />
      <HowWeWorks id="how-we-work" />
      <TestimonialsSection id="testimonial" />
      <Footer />
    </div>
  )
}
