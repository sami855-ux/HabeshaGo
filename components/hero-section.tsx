"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { ArrowRight, Sparkles, Zap, Shield, Battery } from "lucide-react";
import { useEffect, useState } from "react";

export function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [textIndex, setTextIndex] = useState(0);
  const texts = [
    "Drive. Park. Charge. Ride — All in One",
    "Seamless Urban Mobility Solutions",
    "Your Smart City Journey Starts Here",
    "Redefining Urban Transportation",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [texts.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  const features = [
    { icon: Zap, text: "Fast Charging", color: "text-yellow-500" },
    { icon: Shield, text: "Secure Parking", color: "text-blue-500" },
    { icon: Battery, text: "EV Ready", color: "text-green-500" },
    { icon: Sparkles, text: "Smart Routes", color: "text-purple-500" },
  ];

  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-yellow-500/10" />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-orange-500/30 rounded-full"
            initial={{ y: -100, x: Math.random() * 100 }}
            animate={{
              y: ["0vh", "100vh"],
              x: [Math.random() * 100, Math.random() * 100 + 100],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
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

      {/* Main Background Image with Parallax */}
      <motion.div
        style={{ y, backgroundImage: "url('/bg.png')" }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center px-6 max-w-6xl mx-auto h-screen flex flex-col justify-center items-center"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white/90">
              Revolutionizing Urban Mobility
            </span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight mb-6"
        >
          <span className="bg-gradient-to-r from-white via-orange-100 to-yellow-100 bg-clip-text text-transparent">
            Smart Moves for a
          </span>
          <br />
          <motion.span
            className="bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ backgroundSize: "200% auto" }}
          >
            Smarter City.
          </motion.span>
        </motion.h1>

        {/* Rotating Text */}
        <motion.div variants={itemVariants} className="h-12 mb-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={textIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-xl md:text-2xl lg:text-3xl font-medium text-white/90"
            >
              {texts[textIndex]}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Features */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-2xl"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.text}
              custom={i}
              variants={featureVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <feature.icon className={`w-8 h-8 ${feature.color}`} />
              <span className="text-sm font-medium text-white/80">
                {feature.text}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-5 justify-center"
        >
          <Link href="/login">
            <Button
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-12 py-7 text-lg rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                Join Us
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>

          <Link href="/learn-more">
            <Button
              size="lg"
              variant="outline"
              className="group relative overflow-hidden bg-white/5 hover:bg-white/10 text-white border-white/30 hover:border-white/50 px-12 py-7 text-lg rounded-2xl backdrop-blur-sm transition-all duration-300"
            >
              Learn More
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
