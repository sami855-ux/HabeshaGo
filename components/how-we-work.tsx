"use client";

import {
  Bus,
  CarTaxiFront,
  Zap,
  ParkingCircle,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Users,
  Target,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface HowWeWorksProps {
  id?: string;
}

export default function HowWeWorks({ id }: HowWeWorksProps) {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      number: "01",
      title: "Analysis & Planning",
      description:
        "We analyze city transport patterns and plan optimal solutions.",
      icon: <Target className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      number: "02",
      title: "Technology Integration",
      description:
        "Implementing IoT, AI, and smart sensors for mobility solutions.",
      icon: <Zap className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
    },
    {
      number: "03",
      title: "Deployment & Launch",
      description:
        "Rolling out services across the city with real-time monitoring.",
      icon: <Clock className="w-6 h-6" />,
      color: "from-orange-500 to-yellow-500",
    },
    {
      number: "04",
      title: "Optimization & Growth",
      description:
        "Continuous improvement based on user feedback and analytics.",
      icon: <Users className="w-6 h-6" />,
    },
  ];

  const services = [
    {
      title: "Smart Transport System",
      description:
        "Unified digital platform connecting public and private transport modes.",
      icon: <CarTaxiFront size={32} strokeWidth={1.5} />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      gradient: "from-blue-500 to-cyan-500",
      stats: ["99.9% Uptime", "Real-time Tracking"],
    },
    {
      title: "Minibus Contract Service",
      description: "Digitalized minibus transportation with smart scheduling.",
      icon: <Bus size={32} strokeWidth={1.5} />,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      gradient: "from-green-500 to-emerald-500",
      stats: ["50% Faster", "24/7 Support"],
    },
    {
      title: "EV Charging Network",
      description:
        "Connected EV charging ecosystem for seamless station access.",
      icon: <Zap size={32} strokeWidth={1.5} />,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      gradient: "from-yellow-500 to-orange-500",
      stats: ["Fast Charging", "100+ Stations"],
    },
    {
      title: "Smart Parking Solutions",
      description: "IoT-powered parking management reducing congestion.",
      icon: <ParkingCircle size={32} strokeWidth={1.5} />,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      gradient: "from-purple-500 to-pink-500",
      stats: ["90% Time Saved", "Smart Detection"],
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
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section
      id={id}
      className="relative py-16 md:py-24 px-4 overflow-hidden bg-gradient-to-b from-background via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900/90"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-tr from-orange-500/5 to-yellow-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20"
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
              Our Methodology
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3"
          >
            <span className="text-gradient bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
              How We
            </span>
            <span className="text-foreground ml-2">Work</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            A step-by-step approach to transforming urban mobility through
            technology
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* LEFT: Images with Animation */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative"
          >
            {/* Main Image Container */}
            <motion.div
              variants={itemVariants}
              className="relative rounded-2xl overflow-hidden shadow-lg"
            >
              {/* Main Image */}
              <div className="relative h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
                <img
                  src="/big-im.png"
                  alt="Smart city transportation system"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            </motion.div>

            {/* Process Steps Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8"
            >
              <div className="glass-effect rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-6 text-center">
                  Our Process
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {steps.map((step, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveStep(index)}
                      className={`relative p-4 rounded-xl transition-colors duration-300 ${
                        activeStep === index
                          ? "bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/30"
                          : "bg-white/50 dark:bg-gray-800/50 border border-transparent"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`text-2xl font-bold mb-2 ${
                            activeStep === index
                              ? "text-gradient bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent"
                              : "text-gray-400"
                          }`}
                        >
                          {step.number}
                        </div>
                        <div className="text-sm font-medium line-clamp-2">
                          {step.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {step.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT: Service list */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {services.map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="relative"
              >
                <div className="flex gap-4 items-start p-5 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
                  {/* Icon Container */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center`}
                  >
                    <div className={item.color}>{item.icon}</div>
                  </div>

                  <div className="flex-1">
                    {/* Title with Count */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        0{idx + 1}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {item.description}
                    </p>

                    {/* Stats Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {item.stats.map((stat, statIdx) => (
                        <span
                          key={statIdx}
                          className={`px-2 py-1 rounded-md text-xs font-medium ${item.bgColor} ${item.color}`}
                        >
                          {stat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* FULL WIDTH Orange CTA Section */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-12 md:mt-16">
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
              <CheckCircle className="w-5 h-5 text-white" />
              <span className="text-sm font-medium text-white">
                Ready to Transform?
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              Join the Smart City Revolution
            </h3>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto text-lg">
              Be part of the future of urban mobility. Get started today with
              our comprehensive solutions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 rounded-xl bg-white text-orange-600 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
                Request Demo
              </button>
              <button className="px-8 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white font-semibold border-2 border-white/30 transition-all duration-300 hover:bg-white/20">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
