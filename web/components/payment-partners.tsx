"use client"

const PARTNERS = [
  {
    name: "Telebirr",
    src: "/telebirr.png",
    desc: "Ethio Telecom Mobile Money",
  },
  {
    name: "CBE Birr",
    src: "/cbebirr.jpeg",
    desc: "Commercial Bank of Ethiopia",
  },
  {
    name: "Amole",
    src: "/amole.jpeg",
    desc: "Dashen Bank Digital Wallet",
  },
  {
    name: "M-Pesa",
    src: "/mpesa.png",
    desc: "Safaricom Ethiopia",
  },
  {
    name: "Chapa",
    custom: true,
    desc: "Ethiopian Payment Gateway",
  },
]

export function PaymentPartnersSection() {
  return (
    <section className="relative py-8 sm:py-10 border-b border-gray-100 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600 mb-1">
            Supported Payment Systems
          </p>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            Pay Instantly with Ethiopian Gateways
          </h3>
        </div>

        {/* Clean, Fully Colored Brand Row - No Grayscale */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-14 py-2">
          {PARTNERS.map((partner) => (
            <div
              key={partner.name}
              className="flex flex-col items-center justify-center transition-transform hover:scale-105 duration-200"
            >
              <div className="h-10 w-24 flex items-center justify-center mb-1.5">
                {partner.custom ? (
                  <span className="font-extrabold text-sm sm:text-base tracking-wider text-emerald-600 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-100">
                    CHAPA
                  </span>
                ) : (
                  <img
                    src={partner.src}
                    alt={partner.name}
                    className="max-h-9 max-w-full object-contain drop-shadow-xs"
                  />
                )}
              </div>
              <span className="text-[11px] font-medium text-gray-700">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
