"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  MapPin,
  Phone,
  Mail,
  ArrowUp,
  Bus,
  Ticket,
  Navigation,
  ShieldCheck,
  Send,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Heart,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [year] = useState(() => new Date().getFullYear())

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
    setTimeout(() => {
      setSubscribed(false)
      setEmail("")
    }, 3000)
  }

  const passengerLinks = [
    { name: "Book Bus Ticket", href: "/login" },
    { name: "Search All Routes", href: "#features" },
    { name: "Live Seat Selection", href: "#features" },
    { name: "Live GPS Tracker", href: "#digital-pass" },
    { name: "HabeshaGo Wallet", href: "/login" },
    { name: "Ticket Sharing", href: "#digital-pass" },
  ]

  const popularRoutes = [
    { name: "Addis Ababa ⇄ Hawassa", href: "#features" },
    { name: "Addis Ababa ⇄ Bahir Dar", href: "#features" },
    { name: "Addis Ababa ⇄ Gondar", href: "#features" },
    { name: "Addis Ababa ⇄ Dire Dawa", href: "#features" },
    { name: "Addis Ababa ⇄ Adama", href: "#features" },
    { name: "Addis Ababa ⇄ Jimma", href: "#features" },
  ]

  const operatorLinks = [
    { name: "Operator Portal Login", href: "/login" },
    { name: "Register Bus Fleet", href: "/login" },
    { name: "Driver Verification App", href: "/login" },
    { name: "Automated Daily Payouts", href: "#how-we-work" },
    { name: "Safety & Dispatch Rules", href: "#faq" },
  ]

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Baggage & Travel Rules", href: "#faq" },
    { name: "Refund & Cancellation Policy", href: "#faq" },
  ]

  return (
    <footer id="footer" className="relative bg-black text-white pt-16 sm:pt-20 pb-12 overflow-hidden border-t border-border/40">
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-orange-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Back to Top Floating Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-xl hover:shadow-orange-500/30 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Newsletter & Promo Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/5 backdrop-blur-md mb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7">
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-400 block mb-1">
                Special Ethiopian Traveler Offer
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Get 10% Off Your First Trip with Code:{" "}
                <span className="text-amber-400 font-mono font-extrabold underline">
                  HABESHA10
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-xl">
                Subscribe to our fare alerts and receive weekly discounts on intercity bus routes across Ethiopia.
              </p>
            </div>

            <div className="lg:col-span-5">
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold text-xs sm:text-sm px-4 sm:px-6 rounded-xl shadow-md transition-all shrink-0"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  <span>Join</span>
                </Button>
              </form>
              {subscribed && (
                <div className="text-xs text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Thank you! Your promo code has been activated.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-14">
          {/* Brand Info (Col 1) */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-yellow-500 flex items-center justify-center text-white">
                <Bus className="w-4 h-4" />
              </div>
              <span className="text-xl font-grotesk font-extrabold bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                Habesha<span className="text-white">Go</span>
              </span>
            </Link>

            <p className="text-xs text-white/70 leading-relaxed mb-4">
              Ethiopia&apos;s leading digital bus transportation platform. Seamless route search, live seat selection, digital QR boarding, and verified operator fleet management.
            </p>

            <div className="space-y-2 text-xs text-white/75">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>Bole, Addis Ababa, Ethiopia</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>+251 911 000 000 (24/7 Support)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>support@habeshago.et</span>
              </div>
            </div>
          </div>

          {/* Passenger Services (Col 2) */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Passenger Tools
            </h4>
            <ul className="space-y-2 text-xs">
              {passengerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-orange-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Routes (Col 3) */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Top Corridors
            </h4>
            <ul className="space-y-2 text-xs">
              {popularRoutes.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-orange-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Operators (Col 4) */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              For Fleet Operators
            </h4>
            <ul className="space-y-2 text-xs">
              {operatorLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-orange-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Compliance (Col 5) */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Safety &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-orange-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-4 border-t border-white/10">
              <span className="text-[10px] text-white/50 block mb-2 font-medium">
                PAYMENT COMPLIANCE
              </span>
              <div className="flex items-center gap-1.5 text-xs text-white/80 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Telebirr &amp; CBE Certified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Social */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div>
            © {year} HabeshaGo Transit Technologies Ltd. All rights reserved. Built with pride for Ethiopia.
          </div>

          <div className="flex items-center gap-4 text-white/60">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-orange-400 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-orange-400 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-orange-400 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-orange-400 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
