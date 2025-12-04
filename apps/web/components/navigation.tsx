"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/10 dark:bg-black/20 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-black dark:text-white"
          >
            HabeshaGo
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-black dark:text-white">
            <Link
              href="#services"
              className="hover:text-orange-400 font-medium transition"
            >
              Services
            </Link>
            <Link
              href="#how-we-work"
              className="hover:text-orange-400 font-medium transition"
            >
              How We Work
            </Link>
            <Link
              href="#testimonial"
              className="hover:text-orange-400 font-medium transition"
            >
              Testimonials
            </Link>
            <Link
              href="#footer"
              className="hover:text-orange-400 font-medium transition"
            >
              Footer
            </Link>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button className="bg-orange-500 hover:bg-orange-600 text-black font-semibold">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
