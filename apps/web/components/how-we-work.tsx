"use client";

import {
  Bus,
  CarTaxiFront,
  Zap,
  ParkingCircle,
} from "lucide-react";

export default function HowWeWorks() {
  const services = [
    {
      title: "Smart Transport System",
      description:
        "A unified digital platform that connects public and private transport modes — enhancing coordination, safety, and efficiency across the city.",
      icon: <CarTaxiFront size={28} strokeWidth={1.5} />,
    },
    {
      title: "Minibus Contract Service",
      description:
        "We digitalize minibus transportation with smart scheduling, passenger management, and route optimization to make daily commutes faster and more reliable.",
      icon: <Bus size={28} strokeWidth={1.5} />,
    },
    {
      title: "EV Charging Network",
      description:
        "A connected EV charging ecosystem that enables users to find, reserve, and pay for stations seamlessly while promoting sustainable transport.",
      icon: <Zap size={28} strokeWidth={1.5} />,
    },
    {
      title: "Smart Parking Solutions",
      description:
        "IoT-powered parking management that lets drivers locate, reserve, and pay for slots, reducing congestion and improving convenience.",
      icon: <ParkingCircle size={28} strokeWidth={1.5} />,
    },
  ];

  return (
    <section className="py-20 bg-[#F7F7F7] px-4">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-yellow-500 tracking-wide mb-1">
            Our Goods
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            How We Works
          </h2>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* LEFT: stacked images with overlap */}
          <div className="relative">
            {/* Big image container */}
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img
                src="/big-im.png"
                alt="City street view"
                className="w-full h-[420px] object-cover md:h-[640px] lg:h-[620px]"
              />
            </div>

            {/* Overlapping framed image */}
            <div
              className="
                hidden md:block
                absolute
                left-[18%] top-[68%] translate-y-[-50%]
                w-[320px] h-[220px]
                md:left-[22%] md:w-[360px] md:h-[260px]
                lg:left-[32%] lg:w-[420px] lg:h-[400px]
                transform
              "
              aria-hidden="true"
            >
              {/* White frame */}
              <div className="w-full h-full bg-white rounded-md shadow-2xl transform rotate-0">
                <div className="w-full h-full overflow-hidden rounded-sm border-8 border-white">
                  <img
                    src="/small-im.png"
                    alt="Urban transport"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* For small screens show smaller image below the big one instead of overlap */}
            <div className="md:hidden mt-6 rounded-lg overflow-hidden shadow-md">
              <img
                src="/left-small.jpg"
                alt="Urban transport"
                className="w-full h-56 object-cover"
              />
            </div>
          </div>

          {/* RIGHT: service list */}
          <div className="space-y-8">
            {services.map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-white shadow-md flex items-center justify-center text-orange-600">
                  {item.icon}
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
