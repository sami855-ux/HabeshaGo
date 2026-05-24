"use client"

import { Suspense } from "react"
import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  CheckCircle2,
  Download,
  ArrowRight,
  Ticket,
  Wallet,
  Bus,
  MapPin,
  Clock,
  ChevronRight,
  Share2,
  Home,
} from "lucide-react"

const cn = (...classes) => classes.filter(Boolean).join(" ")

function AnimatedAmount({ target, currency = "ETB" }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = null
    const duration = 1200
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setVal(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
      else setVal(target)
    }
    requestAnimationFrame(step)
  }, [target])
  return (
    <span className="tabular-nums">
      {currency} {val.toLocaleString()}
    </span>
  )
}

function Particles() {
  const canvas = useRef(null)
  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const ctx = c.getContext("2d")
    c.width = c.offsetWidth
    c.height = c.offsetHeight
    const colors = [
      "#22c55e",
      "#4ade80",
      "#86efac",
      "#fbbf24",
      "#f59e0b",
      "#34d399",
    ]
    const particles = Array.from({ length: 80 }, () => ({
      x: c.width / 2,
      y: c.height / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.7) * 14,
      r: Math.random() * 5 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
      decay: Math.random() * 0.015 + 0.008,
    }))
    let frame
    const animate = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.3
        p.life -= p.decay
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      })
      if (particles.some((p) => p.life > 0))
        frame = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(frame)
  }, [])
  return (
    <canvas
      ref={canvas}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}

// ✅ Inner component that uses useSearchParams
function PaymentSuccessContent() {
  const router = useRouter()

  const params = new URLSearchParams(
    typeof window !== "undefined"
      ? window.location.search.replaceAll("&amp;", "&")
      : "",
  )

  const ref = params.get("ref") || "TXN-2025-001"
  const flow = params.get("flow") || "WALLET_TOPUP"
  const amount = Number(params.get("amount") || 150)

  const [visible, setVisible] = useState(false)
  const [showParticles, setShowParticles] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100)
    const t2 = setTimeout(() => setShowParticles(true), 300)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  const flowMeta = {
    BUS_TICKET: {
      icon: <Bus size={20} />,
      label: "Bus Ticket",
      detail: "Addis Ababa → Hawassa",
      sub: "Seat 14A • Express • Jul 14, 2025",
      color: "from-emerald-500 to-teal-600",
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    },
    WALLET_TOPUP: {
      icon: <Wallet size={20} />,
      label: "Wallet Top-up",
      detail: "Balance Updated",
      sub: "Available instantly",
      color: "from-violet-500 to-purple-600",
      badge: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    },
    EV_CHARGING: {
      icon: <span className="text-base">⚡</span>,
      label: "EV Charging",
      detail: "Station: Bole Station 3",
      sub: "Connector locked • Ready to charge",
      color: "from-yellow-500 to-amber-600",
      badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    },
    PARKING: {
      icon: <MapPin size={20} />,
      label: "Parking",
      detail: "Lot B — Slot 22",
      sub: "2hrs reserved • Valid until 4:00 PM",
      color: "from-sky-500 to-blue-600",
      badge: "bg-sky-500/15 text-sky-400 border-sky-500/20",
    },
    DIRECT_PAYMENT: {
      icon: <Bus size={20} />,
      label: "Bus Ticket",
      detail: "Ticket Booking",
      sub: "Your ticket has been issued",
      color: "from-emerald-500 to-teal-600",
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    },
  }

  const meta = flowMeta[flow] || flowMeta.BUS_TICKET

  const steps = [
    { label: "Payment Initiated", done: true, time: "10:42 AM" },
    { label: "Chapa Verified", done: true, time: "10:42 AM" },
  ]

  const getHomeRoute = () => {
    if (flow === "BOOKING" || flow === "DIRECT_PAYMENT") return "/user/trips"
    return "/user"
  }

  const getHomeLabel = () => {
    if (flow === "BOOKING" || flow === "DIRECT_PAYMENT") return "My Tickets"
    return "Home"
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans overflow-x-hidden">
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .syne { font-family: 'Syne', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ringPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50%      { box-shadow: 0 0 0 20px rgba(34,197,94,0); }
        }
        @keyframes shimmer {
          from { background-position: -200% center; }
          to   { background-position: 200% center; }
        }
        @keyframes lineGrow {
          from { width: 0; }
          to   { width: 100%; }
        }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) both; }
        .scale-in { animation: scaleIn 0.5s cubic-bezier(.34,1.56,.64,1) both; }
        .ring-pulse { animation: ringPulse 2s ease-in-out infinite; }
        .shimmer-text {
          background: linear-gradient(90deg, #22c55e, #4ade80, #a3e635, #22c55e);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .glass {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
        }
        .card-hover { transition: transform 0.2s ease, border-color 0.2s ease; }
        .card-hover:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.15) !important; }
      `}</style>

      {/* ── Background glow ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-teal-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-12 pb-24">
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between mb-10 fade-up"
          style={{ animationDelay: "0ms" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black font-bold text-sm syne">
              H
            </div>
            <span className="syne font-700 text-white tracking-tight">
              HabeshaGo
            </span>
          </div>
          <button
            onClick={() => router.push(getHomeRoute())}
            className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <Home size={14} /> {getHomeLabel()}
          </button>
        </div>

        {/* ── Hero check ── */}
        <div
          className="flex flex-col items-center text-center mb-10 scale-in"
          style={{ animationDelay: "100ms" }}
        >
          <div className="relative mb-6">
            {showParticles && <Particles />}
            <div className="ring-pulse w-24 h-24 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                <CheckCircle2
                  size={32}
                  className="text-black"
                  strokeWidth={2.5}
                />
              </div>
            </div>
          </div>

          <p className="text-white/40 text-sm uppercase tracking-[0.2em] mb-2 font-medium">
            Payment Confirmed
          </p>
          <h1 className="syne text-4xl font-800 text-white mb-1">
            <AnimatedAmount target={amount} />
          </h1>
          <p className="text-white/35 text-sm mt-1">
            Ref: <span className="text-white/60 font-mono">{ref}</span>
          </p>
        </div>

        {/* ── Service card ── */}
        <div
          className={cn("glass rounded-2xl p-5 mb-4 card-hover fade-up")}
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg",
                meta.color,
              )}
            >
              {meta.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-white text-sm">
                  {meta.detail}
                </span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full border font-medium",
                    meta.badge,
                  )}
                >
                  {meta.label}
                </span>
              </div>
              <p className="text-white/40 text-xs">{meta.sub}</p>
            </div>
            <ChevronRight size={16} className="text-white/20 flex-shrink-0" />
          </div>
        </div>

        {/* ── Timeline ── */}
        <div
          className="glass rounded-2xl p-5 mb-4 fade-up"
          style={{ animationDelay: "300ms" }}
        >
          <p className="text-white/40 text-xs uppercase tracking-widest mb-4 font-medium">
            Processing Steps
          </p>
          <div className="space-y-0">
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                      s.done
                        ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                        : "bg-white/10",
                    )}
                  >
                    {s.done && (
                      <CheckCircle2
                        size={12}
                        className="text-black"
                        strokeWidth={3}
                      />
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px h-6 bg-white/10 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm",
                        s.done ? "text-white" : "text-white/30",
                      )}
                    >
                      {s.label}
                    </span>
                    <span className="text-white/25 text-xs font-mono">
                      {s.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="space-y-3 fade-up" style={{ animationDelay: "460ms" }}>
          <div className="grid grid-cols-2 gap-3">
            <button className="h-12 glass rounded-xl text-white/70 hover:text-white text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.97] card-hover">
              <Download size={15} />
              Download
            </button>
            <button className="h-12 glass rounded-xl text-white/70 hover:text-white text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.97] card-hover">
              <Share2 size={15} />
              Share
            </button>
          </div>

          <button
            onClick={() => router.back()}
            className="w-full h-11 text-white/30 hover:text-white/60 text-sm transition-colors flex items-center justify-center gap-1.5"
          >
            Back to Home
          </button>
        </div>

        {/* ── Footer note ── */}
        <p
          className="text-center text-white/20 text-xs mt-8 fade-up leading-relaxed"
          style={{ animationDelay: "540ms" }}
        >
          A confirmation has been sent to your phone & email.
          <br />
          Need help?{" "}
          <span className="text-white/40 underline cursor-pointer">
            Contact support
          </span>
        </p>
      </div>
    </div>
  )
}

// ✅ Default export wraps inner component in Suspense
export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}
