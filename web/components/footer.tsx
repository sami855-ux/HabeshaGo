"use client";

import {
  MapPin,
  Phone,
  Mail,
  Globe,
  ArrowUp,
  Sparkles,
  Heart,
  Shield,
  Zap,
  Send,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Bus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Custom Icon Components defined at the top
const ParkingIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const TicketIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
    />
  </svg>
);

const AnalyticsIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const FleetIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle
      cx="12"
      cy="12"
      r="3"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
  </svg>
);

export function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [year] = useState(new Date().getFullYear());

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 3000);
      setEmail("");
    }
  };

  const quickLinks = [
    { name: "Home", href: "/", icon: "🏠" },
    { name: "EV Charging", href: "#services", icon: "⚡" },
    { name: "Minibus Contract", href: "#how-we-work", icon: "🚌" },
    { name: "Smart Parking", href: "#services", icon: "🅿️" },
    { name: "Bus Ticketing", href: "#services", icon: "🎫" },
    { name: "Testimonials", href: "#testimonial", icon: "⭐" },
  ];

  const services = [
    {
      name: "Minibus Contract",
      href: "#how-we-work",
      icon: <Bus className="w-4 h-4" />,
    },
    {
      name: "EV Charging",
      href: "#services",
      icon: <Zap className="w-4 h-4" />,
    },
    { name: "Smart Parking", href: "#services", icon: <ParkingIcon /> },
    { name: "Bus Ticketing", href: "#services", icon: <TicketIcon /> },
    {
      name: "Transport Analytics",
      href: "/analytics",
      icon: <AnalyticsIcon />,
    },
    { name: "Fleet Management", href: "/fleet", icon: <FleetIcon /> },
  ];

  const company = [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Blog", href: "/blog" },
    { name: "Press", href: "/press" },
    { name: "Partners", href: "/partners" },
    { name: "Contact", href: "#footer" },
  ];

  const legal = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Data Protection", href: "/data-protection" },
  ];

  const socialLinks = [
    {
      icon: <Linkedin className="w-5 h-5" />,
      href: "https://linkedin.com",
      label: "LinkedIn",
    },
    {
      icon: <Twitter className="w-5 h-5" />,
      href: "https://twitter.com",
      label: "Twitter",
    },
    {
      icon: <Facebook className="w-5 h-5" />,
      href: "https://facebook.com",
      label: "Facebook",
    },
    {
      icon: <Instagram className="w-5 h-5" />,
      href: "https://instagram.com",
      label: "Instagram",
    },
    {
      icon: <Youtube className="w-5 h-5" />,
      href: "https://youtube.com",
      label: "YouTube",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <footer
      id="footer"
      className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-blue-900 to-indigo-950 text-white"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />

        {/* Gradient Orbs */}
        <div className="absolute -top-40 left-1/4 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-gradient-to-tr from-orange-500/10 to-yellow-500/10 rounded-full blur-3xl" />

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 50 - 25, 0],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: showBackToTop ? 1 : 0,
          y: showBackToTop ? 0 : 20,
        }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
      </motion.button>

      <div className="relative z-10 max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid lg:grid-cols-5 gap-12 mb-16"
        >
          {/* Brand & Newsletter */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center"
              >
                <span className="text-white font-bold text-sm">H</span>
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-orange-100 to-yellow-100 bg-clip-text text-transparent">
                HabeshaGo
              </h2>
            </div>

            <p className="text-white/80 mb-8 leading-relaxed">
              Revolutionizing urban mobility with smart transportation
              solutions. We connect people, technology, and cities for a
              sustainable future.
            </p>

            {/* Newsletter */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <h3 className="text-lg font-semibold">Stay Updated</h3>
              </div>

              <motion.form
                onSubmit={handleSubscribe}
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 backdrop-blur-sm"
                    required
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 flex items-center gap-2"
                  >
                    <span>Subscribe</span>
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>

                {isSubscribed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30"
                  >
                    <p className="text-sm text-green-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Thank you for subscribing! Welcome to our community.
                    </p>
                  </motion.div>
                )}
              </motion.form>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    variants={itemVariants}
                    custom={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    whileHover={{ y: -5, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center transition-all duration-300 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              Quick Links
            </h3>
            <nav className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 text-white/80 hover:text-orange-400 transition-colors duration-300 group py-2"
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span className="group-hover:translate-x-1 transition-transform">
                      {link.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>

          {/* Our Services */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Our Services
            </h3>
            <nav className="space-y-3">
              {services.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={service.href}
                    className="flex items-center gap-3 text-white/80 hover:text-orange-400 transition-colors duration-300 group py-2"
                  >
                    <span className="text-orange-500">{service.icon}</span>
                    <span className="group-hover:translate-x-1 transition-transform">
                      {service.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              Contact Us
            </h3>
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all duration-300"
              >
                <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Headquarters</p>
                  <p className="text-sm text-white/70 mt-1">
                    Addis Ababa, Ethiopia
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all duration-300"
              >
                <Phone className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Phone</p>
                  <p className="text-sm text-white/70 mt-1">+251 9XX XXX XXX</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all duration-300"
              >
                <Mail className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-sm text-white/70 mt-1">
                    info@habeshago.com
                  </p>
                </div>
              </motion.div>

              {/* Download App CTA */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 rounded-xl bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30"
              >
                <p className="text-sm font-semibold mb-2">Download Our App</p>
                <div className="flex gap-3">
                  <button className="flex-1 px-3 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                    App Store
                  </button>
                  <button className="flex-1 px-3 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                    Play Store
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-12"
        />

        {/* Bottom Section */}
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white/60 text-sm"
          >
            <p>&copy; {year} HabeshaGo. All rights reserved.</p>
            <p className="mt-1 flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" />{" "}
              in Ethiopia
            </p>
          </motion.div>

          {/* Company & Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6 text-sm"
          >
            {company.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white/70 hover:text-orange-400 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-end gap-6 text-sm"
          >
            {legal.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white/70 hover:text-orange-400 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 pt-8 border-t border-white/10"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-80">
            {[
              { label: "SSL Secured", color: "text-green-500" },
              { label: "GDPR Compliant", color: "text-blue-500" },
              { label: "ISO Certified", color: "text-purple-500" },
              { label: "24/7 Support", color: "text-orange-500" },
            ].map((badge, index) => (
              <div key={badge.label} className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${badge.color} animate-pulse`}
                />
                <span className="text-sm text-white/70">{badge.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Floating Elements Animation */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-20 left-10 opacity-10 pointer-events-none"
        >
          <div className="w-40 h-40 rounded-full border border-white/20" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-20 right-10 opacity-10 pointer-events-none"
        >
          <div className="w-32 h-32 rounded-full border border-white/20" />
        </motion.div>
      </div>
    </footer>
  );
}
