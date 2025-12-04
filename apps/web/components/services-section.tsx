"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, ParkingSquare, Ticket, Bus } from "lucide-react";
import Link from "next/link";

interface ServicesSectionProps {
  id?: string; // allow section linking
}

export function ServicesSection({ id }: ServicesSectionProps) {
  const services = [
    {
      title: "EV Charging",
      description:
        "Find and charge at convenient EV charging stations across the city.",
      icon: <Zap size={38} strokeWidth={1.6} color="#f97316" />,
    },
    {
      title: "Smart Parking",
      description:
        "Real-time parking availability & instant reservation at your fingertips.",
      icon: <ParkingSquare size={38} strokeWidth={1.6} color="#f97316" />,
    },
    {
      title: "Bus Ticketing",
      description:
        "Purchase tickets instantly & manage your commute efficiently.",
      icon: <Ticket size={38} strokeWidth={1.6} color="#f97316" />,
    },
    {
      title: "Minibus Contract",
      description:
        "Monthly & yearly transport contracts for minibuses, hassle-free.",
      icon: <Bus size={38} strokeWidth={1.6} color="#f97316" />,
    },
  ];

  return (
    <section id={id} className="py-16 md:py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-3">Our Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive solutions designed to move your city forward.
          </p>
        </div>

        {/* Horizontal Slider */}
        <div className="overflow-x-auto no-scrollbar py-4">
          <div className="flex gap-6 min-w-max">
            {services.map((service, index) => (
              <Card
                key={index}
                className="min-w-[280px] md:min-w-[320px] p-6 bg-card border hover:shadow-lg transition-all rounded-xl flex-shrink-0"
              >
                <div className="mb-4">{service.icon}</div>
                <h3 className="font-semibold text-xl mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Button */}
        <div className="flex justify-center mt-10">
          <Button
            asChild
            className="bg-orange-500 hover:bg-orange-600 px-8 py-2 rounded-lg font-medium"
          >
            <Link href="/login">View Services</Link>
          </Button>
        </div>
      </div>

      {/* Slider animation (optional, if you want auto-slide) */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
