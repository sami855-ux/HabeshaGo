"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Quote,
  Star,
  Sparkles,
  Award,
  Zap,
  Users,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";

interface TestimonialsSectionProps {
  id?: string;
}

const testimonials = [
  {
    id: 1,
    name: "Mr. Surafel Mamo",
    role: "Transport Driver",
    company: "Addis Transport Co.",
    image:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Surafel&backgroundColor=ffd700",
    quote:
      "Our drivers and passengers love the new digital contract. It has reduced paperwork and confusion, and now every trip is tracked in real time. It's the smartest upgrade our transport company has made.",
    rating: 5,
    stats: ["50% Time Saved", "100+ Trips/Day", "Real-time Tracking"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    name: "Mr. Samson Abebe",
    role: "EV Owner",
    company: "Green Mobility Solutions",
    image:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Samson&backgroundColor=00b894",
    quote:
      "Finding a charging station used to be stressful, but now it's just one tap away. The app shows nearby EV stations, availability, and even lets me pay instantly. It's futuristic yet practical.",
    rating: 5,
    stats: ["30+ Stations", "Fast Charging", "Easy Payments"],
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 3,
    name: "Ms. Tigist Bekele",
    role: "Daily Commuter",
    company: "University Student",
    image:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Tigist&backgroundColor=fd79a8",
    quote:
      "As a student, I rely on public transport every day. The bus ticketing feature has made my commute so much easier. No more waiting in lines - just scan and go!",
    rating: 5,
    stats: ["90% Faster", "Digital Tickets", "Route Planning"],
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 4,
    name: "Mr. Daniel Worku",
    role: "Parking Manager",
    company: "City Parking Authority",
    image:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel&backgroundColor=0984e3",
    quote:
      "The smart parking system has revolutionized how we manage parking spaces. Real-time availability, automated payments, and reduced congestion - it's a game changer.",
    rating: 5,
    stats: ["80% Occupancy", "Zero Paperwork", "24/7 Monitoring"],
    color: "from-orange-500 to-yellow-500",
  },
  {
    id: 5,
    name: "Ms. Selamawit Tesfaye",
    role: "Business Owner",
    company: "Urban Logistics",
    image:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Selam&backgroundColor=a29bfe",
    quote:
      "Managing our fleet vehicles has never been easier. From parking to charging, everything is integrated in one platform. Efficiency has improved by 40%.",
    rating: 5,
    stats: ["40% Efficiency", "Fleet Management", "Cost Saving"],
    color: "from-indigo-500 to-purple-500",
  },
];

export function TestimonialsSection({ id }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stats = [
    {
      value: "10K+",
      label: "Happy Users",
      icon: Users,
      color: "text-blue-500",
    },
    {
      value: "4.9",
      label: "Average Rating",
      icon: Star,
      color: "text-yellow-500",
    },
    {
      value: "98%",
      label: "Satisfaction",
      icon: Award,
      color: "text-green-500",
    },
    { value: "24/7", label: "Support", icon: Zap, color: "text-orange-500" },
  ];

  const startAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isAutoPlaying) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }

    return () => stopAutoPlay();
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
      scale: 0.9,
    }),
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  return (
    <section
      id={id}
      ref={containerRef}
      className="relative py-20 md:py-32 px-4 overflow-hidden bg-gradient-to-b from-background via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900/90"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-yellow-500/5 to-orange-500/5 rounded-full blur-3xl" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.03]" />

        {/* Floating Quotes */}
        <div className="absolute top-1/4 left-10 opacity-5 dark:opacity-10">
          <Quote className="w-48 h-48 text-blue-500" />
        </div>
        <div className="absolute bottom-1/4 right-10 opacity-5 dark:opacity-10">
          <Quote className="w-48 h-48 text-orange-500 rotate-180" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20"
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
              Customer Stories
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            <span className="text-gradient bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600 bg-clip-text text-transparent">
              Voices of
            </span>
            <span className="text-foreground ml-2">Success</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Discover how our smart mobility solutions are transforming urban
            transportation and creating better experiences for thousands of
            users.
          </motion.p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16 md:mb-24"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="glass-effect rounded-2xl p-6 text-center group"
              >
                <div
                  className={`inline-flex p-3 rounded-xl ${stat.color.replace(
                    "text",
                    "bg"
                  )}/10 mb-4`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left: Testimonial Carousel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="relative h-full">
              {/* Main Testimonial Card */}
              <div className="relative h-full min-h-[500px]">
                <AnimatePresence custom={direction} mode="wait">
                  <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                      scale: { duration: 0.3 },
                    }}
                    className="absolute inset-0"
                  >
                    <Card className="relative overflow-hidden h-full border-0 shadow-2xl group">
                      {/* Gradient Background */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${testimonials[currentIndex].color} opacity-5`}
                      />

                      {/* Pattern Overlay */}
                      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]" />

                      <div className="relative p-8 md:p-12 h-full flex flex-col">
                        {/* Quote Icon */}
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.5, type: "spring" }}
                          className="absolute top-8 right-8 text-orange-500/20 dark:text-orange-400/20"
                        >
                          <Quote className="w-24 h-24 md:w-32 md:h-32" />
                        </motion.div>

                        {/* Rating */}
                        <div className="flex gap-1 mb-8">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.1, type: "spring" }}
                            >
                              <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                            </motion.div>
                          ))}
                        </div>

                        {/* Quote */}
                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-lg md:text-xl lg:text-2xl leading-relaxed mb-8 md:mb-12 flex-1 text-gray-800 dark:text-gray-200"
                        >
                          "{testimonials[currentIndex].quote}"
                        </motion.p>

                        {/* Author Info */}
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" }}
                            className="relative"
                          >
                            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                              <img
                                src={testimonials[currentIndex].image}
                                alt={testimonials[currentIndex].name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {/* Active Indicator */}
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                          </motion.div>

                          {/* Details */}
                          <div className="flex-1">
                            <motion.h3
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 }}
                              className="text-xl font-bold text-gray-900 dark:text-white"
                            >
                              {testimonials[currentIndex].name}
                            </motion.h3>
                            <motion.p
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 }}
                              className="text-gray-600 dark:text-gray-400"
                            >
                              {testimonials[currentIndex].role}
                            </motion.p>
                            <motion.p
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 }}
                              className="text-sm text-gray-500 dark:text-gray-500"
                            >
                              {testimonials[currentIndex].company}
                            </motion.p>
                          </div>
                        </div>

                        {/* Stats Tags */}
                        <div className="flex flex-wrap gap-2 mt-6">
                          {testimonials[currentIndex].stats.map((stat, idx) => (
                            <motion.span
                              key={idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.7 + idx * 0.1 }}
                              className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-orange-500/10 to-yellow-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                            >
                              {stat}
                            </motion.span>
                          ))}
                        </div>
                      </div>

                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-center gap-4 mt-8">
                <Button
                  onClick={goToPrevious}
                  size="icon"
                  className="rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Button>

                {/* Indicators */}
                <div className="flex items-center gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`relative w-2 h-2 rounded-full transition-all duration-300 ${
                        currentIndex === index
                          ? "w-8 bg-gradient-to-r from-orange-500 to-yellow-500"
                          : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    >
                      {currentIndex === index && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={goToNext}
                  size="icon"
                  className="rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Auto-play Toggle */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    isAutoPlaying ? "bg-green-500 animate-pulse" : "bg-gray-400"
                  }`}
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {isAutoPlaying ? "Auto-playing" : "Paused"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right: Featured Testimonials */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold mb-6">Featured Stories</h3>

            {testimonials.slice(0, 3).map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className={`glass-effect rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                  currentIndex === index ? "ring-2 ring-orange-500/50" : ""
                }`}
                onClick={() => goToSlide(index)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </h4>
                      <div className="flex gap-0.5">
                        {Array.from({ length: testimonial.rating }).map(
                          (_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 fill-yellow-500 text-yellow-500"
                            />
                          )
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {testimonial.role}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-2">
                      "{testimonial.quote.substring(0, 100)}..."
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* CTA Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 p-6"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-6 h-6 text-white" />
                  <span className="text-sm font-medium text-white">
                    Join Our Community
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Share Your Story
                </h3>
                <p className="text-white/90 mb-6 text-sm">
                  Be part of the smart city revolution. Share your experience
                  and help others discover better mobility.
                </p>
                <button className="w-full px-4 py-2.5 rounded-lg bg-white text-orange-600 font-semibold hover:bg-gray-50 transition-colors duration-300 text-sm">
                  Share Experience
                </button>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-white/10 blur-xl" />
              <div className="absolute -bottom-10 -left-10 w-20 h-20 rounded-full bg-white/10 blur-xl" />
            </motion.div>
          </motion.div>
        </div>

        {/* Brands/Partners Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-16 md:mt-24"
        >
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Trusted by leading organizations
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-60">
            {[
              "Addis Transport",
              "Green Mobility",
              "City Parking",
              "Urban Logistics",
              "Smart Commute",
            ].map((brand, idx) => (
              <motion.div
                key={brand}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="px-6 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {brand}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
