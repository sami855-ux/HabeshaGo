"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/10 dark:bg-black/20 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-black">
            HabeshaGo
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-black">
            <Link
              href="/"
              className="hover:text-orange-400 font-medium transition"
            >
              Home
            </Link>
            <Link
              href="#ev-charging"
              className="hover:text-orange-400 font-medium transition"
            >
              EV Charging
            </Link>
            <Link
              href="#minibus"
              className="hover:text-orange-400 font-medium transition"
            >
              Minibus Contract
            </Link>
            <Link
              href="#parking"
              className="hover:text-orange-400 font-medium transition"
            >
              Smart Parking
            </Link>
            <Link
              href="#ticketing"
              className="hover:text-orange-400 font-medium transition"
            >
              Bus Ticketing
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
