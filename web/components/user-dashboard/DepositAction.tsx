"use client"

import { Button } from "@/components/ui/button"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  Send,
  Plus,
  Wallet,
  ExternalLink,
  Zap,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function DepositAction() {
  const router = useRouter()
  const buttons = [
    {
      label: "Top Up",
      icon: Plus,
      variant: "default" as const,
      color: "emerald",
      className:
        "group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 text-white",
      glow: "from-emerald-400/40 via-teal-400/20 to-transparent",
      iconBg: "bg-emerald-100/20 text-white",
      hoverEffect:
        "shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40",
      onClick: () => router.push("/user/wallet/deposite"),
    },
    {
      label: "Send",
      icon: Send,
      variant: "default" as const,
      color: "blue",
      className:
        "group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-700 text-white",
      glow: "from-blue-400/40 via-cyan-400/20 to-transparent",
      iconBg: "bg-blue-100/20 text-white",
      hoverEffect: "shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40",
      onClick: () => router.push("/user/wallet/send"),
    },
  ]

  const stats = [
    {
      icon: Zap,
      label: "Instant processing",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: Shield,
      label: "Secure & encrypted",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Clock,
      label: "24/7 available",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: TrendingUp,
      label: "Low fees",
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
  ]

  return (
    <div className="relative">
      {/* Modern grid background effect */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-gray-100/30 dark:from-gray-900/50 dark:via-transparent dark:to-gray-800/30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent dark:via-gray-700/50" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent dark:via-gray-700/50" />

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-300" />
        <div className="absolute bottom-1/4 left-1/3 w-28 h-28 bg-violet-500/5 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {buttons.map((btn, index) => (
          <motion.div
            key={btn.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            // whileHover={{ y: -4, scale: 1.02 }}
            className="relative "
          >
            {/* Subtle glow effect on hover */}
            <div
              className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
              style={{ background: `linear-gradient(135deg, ${btn.glow})` }}
            />

            <Button
              variant={btn.variant}
              className={cn(
                "relative w-full h-[78px] cursor-pointer rounded-md font-semibold  transition-all duration-300",
                "flex flex-col items-center justify-center gap-2 p-3 border-0",
                btn.className,
                btn.hoverEffect,
              )}
              onClick={btn.onClick}
            >
              {/* Icon container with gradient border */}
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-md group-hover:blur-xl transition-all duration-300" />
                <div
                  className={cn("relative z-10 p-2 rounded-full", btn.iconBg)}
                >
                  <btn.icon className="size-5" />
                </div>

                {/* Animated ring effect */}
                <div className="absolute inset-0 rounded-full border-2 border-white/30 group-hover:border-white/50 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500" />
              </div>

              {/* Label with animated underline */}
              <span className="text-sm font-medium relative text-white/95 group-hover:text-white">
                {btn.label}
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white/80 group-hover:w-3/4 group-hover:opacity-100 transition-all duration-300 opacity-0" />
              </span>

              {/* Subtle corner accent */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ExternalLink className="size-3 text-white/70" />
              </div>

              {/* Ripple effect on click */}
              <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Enhanced stats bar with colors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 pb-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            className="flex items-center gap-2 p-2 py-4 rounded-sm backdrop-blur-sm bg-white/40 dark:bg-gray-900/40 border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className={cn("p-1.5 rounded-md", stat.bgColor)}>
              <stat.icon className={cn("size-3.5", stat.color)} />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Floating particles */}
      <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none overflow-hidden rounded-2xl -z-10">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-emerald-400/30 to-blue-400/30 rounded-full"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              opacity: 0,
            }}
            animate={{
              y: [null, `-${Math.random() * 20}px`],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              repeatDelay: 2,
            }}
          />
        ))}
      </div>
    </div>
  )
}
