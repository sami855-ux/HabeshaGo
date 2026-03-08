"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronDown, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/themeToggle"
import { cn } from "@/lib/utils"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)

      const sections = ["services", "how-we-work", "testimonial", "footer"]
      const currentSection = sections.find((section) => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          return rect.top <= 100 && rect.bottom >= 100
        }
        return false
      })

      if (currentSection) setActiveLink(currentSection)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "#services", label: "Services" },
    { href: "#how-we-work", label: "How We Work" },
    { href: "#testimonial", label: "Testimonials" },
    { href: "#footer", label: "Contact" },
  ]

  return (
    <motion.header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "backdrop-blur-sm",
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-xl font-grotesk font-bold bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
              HabeshaGo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setActiveLink(link.href.slice(1))}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                  activeLink === link.href.slice(1)
                    ? "text-orange-500 bg-orange-50 dark:bg-orange-950/20"
                    : isScrolled
                      ? "text-gray-900 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                      : "text-gray-800 dark:text-gray-800 hover:text-orange-500 hover:bg-white/10",
                )}
              >
                {link.label}
                {activeLink === link.href.slice(1) && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Button
              asChild
              size="sm"
              className="hidden md:inline-flex bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg shadow-orange-500/25"
            >
              <Link href="/login">Sign In</Link>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-1 border-t border-border mt-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200",
                        activeLink === link.href.slice(1)
                          ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent",
                      )}
                      onClick={() => {
                        setActiveLink(link.href.slice(1))
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <span>{link.label}</span>
                      <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile Sign In Button */}
                <div className="pt-4">
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
