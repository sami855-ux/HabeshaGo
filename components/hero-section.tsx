"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: "url('/bg.png')" }} // Local Public Image
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-xl">
          Smart Moves for a Smarter City.
        </h1>

        <p className="mt-6 text-2xl md:text-3xl text-white/90 font-medium">
          Drive. Park. Charge. Ride — All in One
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center mt-10">
          <Link href="/login">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-lg rounded-xl"
            >
              Join Us
            </Button>
          </Link>
          <Link href="/learn-more">
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white px-10 py-6 text-lg rounded-xl"
            >
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
