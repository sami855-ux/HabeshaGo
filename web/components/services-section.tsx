"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Zap,
  ParkingSquare,
  Ticket,
  Bus,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

interface ServicesSectionProps {
  id?: string;
}

export function ServicesSection({ id }: ServicesSectionProps) {
  const [hoveredService, setHoveredService] = useState<number | null>(null);

  const services = [
    {
      title: "EV Charging",
      shortDesc: "Fast charging stations across the city",
      icon: <Zap size={36} strokeWidth={1.8} />,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      gradient: "from-yellow-500 to-orange-500",
      features: ["Fast Charging", "Real-time Status"],
    },
    {
      title: "Smart Parking",
      shortDesc: "AI-powered parking solutions",
      icon: <ParkingSquare size={36} strokeWidth={1.8} />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      gradient: "from-blue-500 to-cyan-500",
      features: ["Instant Booking", "Secure Parking"],
    },
    {
      title: "Bus Ticketing",
      shortDesc: "Digital tickets & passes",
      icon: <Ticket size={36} strokeWidth={1.8} />,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      gradient: "from-green-500 to-emerald-500",
      features: ["Digital Passes", "Real-time Tracking"],
    },
    {
      title: "Minibus Contract",
      shortDesc: "Flexible transport contracts",
      icon: <Bus size={36} strokeWidth={1.8} />,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      gradient: "from-purple-500 to-pink-500",
      features: ["Flexible Plans", "24/7 Support"],
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

  const stats = [
    { value: "100+", label: "Stations" },
    { value: "50K+", label: "Users" },
    { value: "24/7", label: "Support" },
    { value: "99%", label: "Rating" },
  ];

  return (
    <section
      id={id}
      className="relative py-16 md:py-24 px-4 bg-gradient-to-b from-background via-white/30 to-background dark:via-gray-900/30 overflow-hidden"
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-orange-500/3 to-yellow-500/3 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-blue-500/3 to-purple-500/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
              Smart Solutions
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3"
          >
            <span className="text-gradient bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
              Mobility Services
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Seamless transportation solutions for modern cities
          </motion.p>
        </div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              onMouseEnter={() => setHoveredService(index)}
              onMouseLeave={() => setHoveredService(null)}
              whileHover={{ y: -4 }}
              className="relative group"
            >
              <Card className="relative h-full border border-gray-200 dark:border-gray-800 bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-orange-500/30">
                {/* Gradient Overlay on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                {/* Content */}
                <div className="relative p-5 md:p-6">
                  {/* Icon */}
                  <motion.div
                    animate={{
                      rotate: hoveredService === index ? 5 : 0,
                      scale: hoveredService === index ? 1.1 : 1,
                    }}
                    className={`inline-flex p-3 rounded-xl ${service.bgColor} mb-4`}
                  >
                    <div className={service.color}>{service.icon}</div>
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-semibold mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {service.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {service.shortDesc}
                  </p>

                  {/* Features - Minimal */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {service.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded-md text-xs font-medium ${service.bgColor} ${service.color} opacity-90`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Arrow Indicator */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Learn more
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 ${service.color} opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300`}
                    />
                  </div>
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-500/20 rounded-[inherit] transition-all duration-300 pointer-events-none" />
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
              >
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/services" className="flex items-center gap-2">
              <span>Explore Services</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-gray-300 dark:border-gray-700 hover:border-orange-500 px-8 py-6 rounded-xl transition-all duration-300"
          >
            <Link href="/demo">
              <span>Book a Demo</span>
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
