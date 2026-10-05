"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, MessageSquare } from "lucide-react"

interface FAQSectionProps {
  id?: string
}

const FAQS = [
  {
    q: "How do I board the bus using my HabeshaGo digital ticket?",
    a: "Once your booking is confirmed, your digital boarding pass with a secure QR code is available directly in the web app and sent via SMS. When you arrive at the terminal or station, simply present the QR code on your phone screen to the bus captain. The driver will scan it in under a second with their validator device. No paper printouts are required!",
  },
  {
    q: "Which payment methods are supported for booking in Ethiopia?",
    a: "HabeshaGo supports all major Ethiopian digital payment systems including Telebirr, CBE Birr (Commercial Bank of Ethiopia), Chapa, Dashen Amole, and Safaricom M-Pesa, as well as the HabeshaGo Digital Wallet. Payments are processed in Ethiopian Birr (ETB) with zero delay.",
  },
  {
    q: "Can I choose my preferred seat (window, aisle, or VIP front)?",
    a: "Yes! HabeshaGo features interactive real-time seat selection. You can view the full coach cabin map showing occupied, reserved, and open seats. You select your exact seat number before paying, giving you 100% guarantee that your seat will be reserved.",
  },
  {
    q: "How does the ticket sharing feature work?",
    a: "If you book multiple tickets for family or friends, you don't need to forward screenshots. You can click 'Share Ticket' on any individual seat pass, enter the recipient's phone number, and HabeshaGo will immediately generate and dispatch an authentic digital boarding pass to their phone.",
  },
  {
    q: "What is your ticket cancellation and refund policy?",
    a: "You can cancel or reschedule your ticket directly from your passenger dashboard up to 2 hours prior to scheduled coach departure. Refunds are credited instantly to your HabeshaGo Wallet or refunded back to your Telebirr / CBE account according to company refund guidelines.",
  },
  {
    q: "How can bus companies and minibus owners join the HabeshaGo network?",
    a: "Bus operators and fleet managers can register through our Operator Portal. HabeshaGo provides complete fleet scheduling software, automated seat manifests, driver scanning apps, GPS tracking hardware integration, and automated daily bank settlements.",
  },
]

export function FAQSection({ id }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id={id} className="relative py-20 sm:py-28 px-4 bg-background">
      <div className="max-w-3xl mx-auto">
        {/* Header Without Sparkles */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-orange-500 mb-2">
            FAQ
          </p>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Frequently Asked Questions
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-xl mx-auto">
            Everything you need to know about booking, traveling, payments, and fleet management on HabeshaGo.
          </p>
        </div>

        {/* Clean, Borderless Accordion List */}
        <div className="divide-y divide-border/40">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div key={index} className="py-4">
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left flex items-center justify-between gap-4 py-2"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-foreground">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? "bg-orange-500 text-white rotate-180"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="pt-2 pb-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Clean Support Banner */}
        <div className="mt-14 p-6 rounded-2xl bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">
                Need assistance with your booking?
              </div>
              <div className="text-xs text-muted-foreground">
                Our Addis Ababa customer support desk is active 24/7.
              </div>
            </div>
          </div>

          <a
            href="tel:+251911000000"
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold whitespace-nowrap transition-colors"
          >
            Call 24/7 (+251 911 000 000)
          </a>
        </div>
      </div>
    </section>
  )
}
