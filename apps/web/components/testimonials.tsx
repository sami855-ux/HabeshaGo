"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TestimonialsSectionProps {
  id?: string; // allow navigation scrolling
}

const testimonials = [
  {
    id: 1,
    name: "Mr. Surafel Mamo",
    role: "Driver",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Surafel",
    quote:
      "Our drivers and passengers love the new digital contract. It has reduced paperwork and confusion, and now every trip is tracked in real time. It's the smartest upgrade our transport company has made.",
    rating: 5,
  },
  {
    id: 2,
    name: "Mr. Samson Abebe",
    role: "Car Owner",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Samson",
    quote:
      "Finding a charging station used to be stressful, but now it's just one tap away. The app shows nearby EV stations, availability, and even lets me pay instantly. It's futuristic yet practical.",
    rating: 5,
  },
];

export function TestimonialsSection({ id }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const getVisibleTestimonials = () => {
    const first = testimonials[currentIndex];
    const second = testimonials[(currentIndex + 1) % testimonials.length];
    return [first, second];
  };

  return (
    <section id={id} className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-yellow-400 rounded"></div>
            <span className="text-sm font-semibold text-gray-600 uppercase">
              Testimonial
            </span>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-4xl md:text-5xl font-bold text-black">
              What Our Customers Say
            </h2>
            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={goToPrevious}
                size="icon"
                className="rounded-full bg-yellow-400 hover:bg-yellow-500 text-black"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                onClick={goToNext}
                size="icon"
                className="rounded-full bg-blue-900 hover:bg-blue-950 text-white"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Testimonials Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {getVisibleTestimonials().map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`rounded-lg p-8 relative overflow-hidden transition-all duration-300 ${
                index === 0
                  ? "bg-gray-400 text-black"
                  : "bg-[#000033] text-white"
              }`}
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-yellow-400 text-4xl opacity-90">
                ❝
              </div>

              {/* Customer Info */}
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full border-2 border-yellow-400"
                />
                <div>
                  <h3 className="font-bold text-lg">{testimonial.name}</h3>
                  <p className="text-sm opacity-75">{testimonial.role}</p>
                </div>
              </div>

              {/* Quote */}
              <p className="mb-6 text-sm leading-relaxed">
                {testimonial.quote}
              </p>

              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">
                    ★
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
