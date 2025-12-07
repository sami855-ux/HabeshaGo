"use client";

import { MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Footer() {
  return (
    <footer
      id="footer"
      className="bg-blue-950 text-white py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand & Newsletter */}
          <div>
            <h2 className="text-2xl font-bold mb-6">HabeshaGo</h2>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email here*"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/50 focus:outline-none focus:border-yellow-400"
              />
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                Send Now
              </Button>
            </div>
            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.39v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
                </svg>
              </a>
              {/* Twitter */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2s9 5 20 5a9.5 9.5 0 0 0-9-5.5c4.75 2.25 9-0.5 11-4.5" />
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <nav className="space-y-3">
              {[
                { name: "Home", href: "#hero" },
                { name: "EV Charging", href: "#services" },
                { name: "Minibus Contract", href: "#how-we-work" },
                { name: "Smart Parking", href: "#services" },
                { name: "Bus Ticketing", href: "#services" },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-sm hover:text-yellow-400 transition-colors opacity-90 hover:opacity-100"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Our Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Our Services</h3>
            <nav className="space-y-3">
              {[
                { name: "Minibus Contract", href: "#how-we-work" },
                { name: "EV Charging", href: "#services" },
                { name: "Smart Parking", href: "#services" },
                { name: "Bus Ticketing", href: "#services" },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-sm hover:text-yellow-400 transition-colors opacity-90 hover:opacity-100"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm opacity-90">
                  <p className="font-semibold">Addis Ababa, Ethiopia</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm opacity-90">
                  <p className="font-semibold">+251 9XX XXX XXX</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="border-t border-white/20 pt-8 text-center text-sm opacity-75">
          <p>&copy; 2025 HabeshaGo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
