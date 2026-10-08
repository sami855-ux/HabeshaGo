"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Ticket, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

import { useAppSelector } from "@/store/store"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState("")
  const [mounted, setMounted] = useState(false)

  const { isAuthenticated, user } = useAppSelector((state) => state.user)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)

      const sections = ["features", "digital-pass", "how-we-work", "testimonials", "faq"]
      const currentSection = sections.find((section) => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          return rect.top <= 120 && rect.bottom >= 120
        }
        return false
      })

      if (currentSection) {
        setActiveLink(currentSection)
      } else if (window.scrollY < 150) {
        setActiveLink("")
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#digital-pass", label: "Digital Pass" },
    { href: "#how-we-work", label: "How It Works" },
    { href: "#testimonials", label: "Reviews" },
    { href: "#faq", label: "FAQ" },
  ]

  const isAuth = mounted && isAuthenticated && !!user
  const bookTicketHref = isAuth ? "/user/bus" : "/login"
  const dashboardHref = isAuth
    ? user?.role === "PASSENGER"
      ? "/user"
      : "/admin"
    : "/login"

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sleek compact height: h-14 sm:h-16 */}
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-xl sm:text-2xl font-grotesk font-extrabold tracking-tight text-gray-900 drop-shadow-xs">
              Habesha<span className="text-orange-500">Go</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = activeLink === link.href.slice(1)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setActiveLink(link.href.slice(1))}
                  className={cn(
                    "text-sm font-semibold transition-colors duration-200 relative py-1 drop-shadow-xs",
                    isActive
                      ? "text-orange-600 font-bold"
                      : "text-gray-800 hover:text-orange-600"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right Section: Sign In / Dashboard & Book Ticket */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href={dashboardHref}
              className="hidden sm:inline-flex text-sm font-semibold text-gray-800 hover:text-orange-600 transition-colors drop-shadow-xs"
            >
              {isAuth ? "Dashboard" : "Sign In"}
            </Link>

            <Button
              asChild
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-md shadow-sm transition-all"
            >
              <Link href={bookTicketHref} className="flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5" />
                <span>Book Ticket</span>
              </Link>
            </Button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden p-1.5 text-gray-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden py-3 border-t border-gray-100 bg-white shadow-xl rounded-b-md"
            >
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => {
                      setActiveLink(link.href.slice(1))
                      setIsMobileMenuOpen(false)
                    }}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      activeLink === link.href.slice(1)
                        ? "text-orange-600 bg-orange-50 font-semibold"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                  </Link>
                ))}

                <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                  <Link
                    href={dashboardHref}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    {isAuth ? "Dashboard" : "Sign In"}
                  </Link>
                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md"
                  >
                    <Link href={bookTicketHref} onClick={() => setIsMobileMenuOpen(false)}>
                      Book Bus Ticket
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
