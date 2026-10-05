"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { QRCodeSVG } from "qrcode.react"
import {
  Ticket,
  Navigation,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Bus,
  PhoneCall,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function InteractivePreviewSection({ id }: { id?: string }) {
  const [activeTab, setActiveTab] = useState<"ticket" | "tracker">("ticket")
  const [sharedAlert, setSharedAlert] = useState(false)
  const [sharePhone, setSharePhone] = useState("")
  const [showShareModal, setShowShareModal] = useState(false)

  const handleShareTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sharePhone) return
    setSharedAlert(true)
    setTimeout(() => {
      setSharedAlert(false)
      setShowShareModal(false)
      setSharePhone("")
    }, 2500)
  }

  return (
    <section id={id} className="relative py-20 sm:py-28 px-4 bg-background">
      <div className="max-w-5xl mx-auto">
        {/* Clean Header Without Sparkles */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-orange-500 mb-2">
            Passenger Experience
          </p>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Digital Pass &amp; Live Tracking
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            Say goodbye to paper tickets and station crowds. Experience seamless digital boarding and live satellite bus tracking.
          </p>

          {/* Clean Borderless Switcher */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={() => setActiveTab("ticket")}
              className={`text-sm font-semibold pb-1.5 relative transition-colors ${
                activeTab === "ticket"
                  ? "text-orange-500 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>1. Digital QR Pass</span>
              {activeTab === "ticket" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("tracker")}
              className={`text-sm font-semibold pb-1.5 relative transition-colors ${
                activeTab === "tracker"
                  ? "text-orange-500 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>2. Live GPS Tracker</span>
              {activeTab === "tracker" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Content Showcase */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "ticket" ? (
              <motion.div
                key="ticket-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl bg-muted/40 p-6 sm:p-10 shadow-sm"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  {/* Left Ticket Details (7 Cols) */}
                  <div className="md:col-span-7 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                          <Bus className="w-4 h-4" />
                        </div>
                        <span className="font-grotesk font-extrabold text-base text-foreground">
                          Habesha<span className="text-orange-500">Go</span> Pass
                        </span>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirmed
                      </span>
                    </div>

                    {/* Origin & Destination */}
                    <div className="py-3 border-y border-border/40">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Addis Ababa (Meskel Sq)</span>
                        <span>Hawassa (Piassa)</span>
                      </div>
                      <div className="flex items-center justify-between text-lg sm:text-xl font-bold text-foreground">
                        <span>Addis Ababa</span>
                        <span className="text-orange-500 text-sm">➔</span>
                        <span>Hawassa</span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Passenger</span>
                        <span className="font-bold text-foreground">Abebe T. Kebede</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Seat Number</span>
                        <span className="font-bold text-orange-500">14A (Window)</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Departure</span>
                        <span className="font-bold text-foreground">06:30 AM Tomorrow</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Fare Paid</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">450 ETB</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>Valid for boarding</span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowShareModal(!showShareModal)}
                        className="text-xs text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
                      >
                        <Share2 className="w-3.5 h-3.5 mr-1" />
                        <span>Share Ticket</span>
                      </Button>
                    </div>

                    {showShareModal && (
                      <div className="pt-2">
                        <form onSubmit={handleShareTicket} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Recipient phone (0911234567)"
                            value={sharePhone}
                            onChange={(e) => setSharePhone(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-background border border-border/60 focus:outline-none"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
                          >
                            Send
                          </Button>
                        </form>
                        {sharedAlert && (
                          <span className="text-[11px] text-emerald-500 font-semibold block mt-1">
                            Ticket shared successfully via SMS!
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right QR Code (5 Cols) */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-4">
                    <div className="p-4 rounded-2xl bg-white shadow-sm mb-3">
                      <QRCodeSVG
                        value="https://habeshago.et/verify/HG-8942-ET"
                        size={140}
                        level="H"
                        includeMargin={false}
                        fgColor="#111827"
                      />
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      Scan at Bus Entry
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">
                      Fast contactless check-in
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="tracker-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl bg-muted/40 p-6 sm:p-10 shadow-sm space-y-8"
              >
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-foreground">
                        Selam Luxury Coach #ET-4820
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        Live On Route
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Addis Ababa ➔ Hawassa via Mojo Expressway
                    </span>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-muted-foreground block">Estimated Arrival</span>
                    <span className="text-base font-bold text-orange-500">10:45 AM (On Time)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="h-1.5 rounded-full bg-muted-foreground/20 overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full w-2/3" />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-3">
                    <span>Addis Ababa (06:30 AM)</span>
                    <span className="text-orange-500 font-semibold">Mojo Toll (Now)</span>
                    <span>Hawassa (10:45 AM)</span>
                  </div>
                </div>

                {/* Driver Info */}
                <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                  <div>
                    <span className="font-bold text-foreground">Captain Yohannes Mengistu</span>
                    <span className="text-amber-500 ml-1">★ 4.9</span>
                    <span className="block text-[11px]">8+ Years Highway Experience</span>
                  </div>

                  <a
                    href="tel:+251911000000"
                    className="text-orange-500 hover:text-orange-600 font-semibold"
                  >
                    24/7 Helpline
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
