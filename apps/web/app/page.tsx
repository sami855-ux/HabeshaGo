"use client"

import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import HowWeWorks from "@/components/how-we-work"
import { Navigation } from "@/components/navigation"
import { ServicesSection } from "@/components/services-section"
import { TestimonialsSection } from "@/components/testimonials"
import { ThemeToggle } from "@/components/themeToggle"
import { authClient } from "@/lib/auth-client"

export default function Home() {
  const { data: session, isPending: isLoading } = authClient.useSession()

  if (isLoading) {
    return <div className="">loading.....</div>
  }

  if (session) {
    return <div className="">There is session {session?.user.email}</div>
  }

  return (
    <div className="">
      <ThemeToggle />
      <Navigation/>
      <HeroSection />
      <ServicesSection />
      <HowWeWorks />
      <TestimonialsSection />
      <Footer/>
    </div>
  )
}
