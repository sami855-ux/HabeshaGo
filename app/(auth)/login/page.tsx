"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Loader,
  Send,
  Sparkles,
  Bus,
  Wallet,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"
import { toast } from "sonner"
import { FcGoogle } from "react-icons/fc"
import { FaApple, FaFacebook, FaTiktok } from "react-icons/fa"
import { register } from "@/services/auth.user.api"

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

const COMMON_EMAIL_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "mail.com",
]

/* ---------------------------------- */
/* Slider Content – HabeshaGo */
/* ---------------------------------- */

const SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1600&q=60",
    title: "Book buses across Ethiopia",
    subtitle: "Fast & reliable transport",
    description:
      "Search routes, compare schedules, and reserve your seat in seconds.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1502920514313-52581002a659?w=1600&q=60",
    title: "Smart routes & schedules",
    subtitle: "Travel with confidence",
    description: "Live departure times, route details, and seat availability.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1600&q=60",
    title: "Secure wallet payments",
    subtitle: "Simple & trusted",
    description: "Top up once, pay instantly, and manage all your bookings.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1600&q=60",
    title: "All your trips in one place",
    subtitle: "Easy management",
    description:
      "Tickets, history, notifications, and refunds—organized for you.",
  },
]

const FEATURES = [
  { icon: <Bus className="h-4 w-4" />, label: "Bus Booking" },
  { icon: <MapPin className="h-4 w-4" />, label: "Live Routes" },
  { icon: <Wallet className="h-4 w-4" />, label: "Wallet & Payments" },
]

/* ---------------------------------- */
/* Component */
/* ---------------------------------- */

export default function LoginPage() {
  const router = useRouter()

  const [googlePending, startGoogle] = useTransition()
  const [emailPending, startEmail] = useTransition()

  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [slideIndex, setSlideIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)

  /* ---------------------------------- */
  /* Slider logic */
  /* ---------------------------------- */

  const nextSlide = () => setSlideIndex((p) => (p + 1) % SLIDES.length)

  const prevSlide = () =>
    setSlideIndex((p) => (p === 0 ? SLIDES.length - 1 : p - 1))

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000)
    return () => clearInterval(interval)
  }, [])

  /* ---------------------------------- */
  /* Auth */
  /* ---------------------------------- */

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail(email)) {
      setEmailError("Enter a valid email address")
      return
    }

    startEmail(async () => {
      const res = await register({ email })
      if (!res.success) return
      toast.success("OTP sent to your email")
      router.push(`/verify-request?email=${email}`)
    })
  }

  const signInWithGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`
  }

  const slide = SLIDES[slideIndex]

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* ---------------- LEFT SLIDER ---------------- */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80" />

        {/* Navigation buttons */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/10 backdrop-blur-md p-3 text-white hover:bg-white/20 transition"
        >
          <ChevronLeft />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/10 backdrop-blur-md p-3 text-white hover:bg-white/20 transition"
        >
          <ChevronRight />
        </button>

        <div className="relative z-10 p-16 flex flex-col justify-between w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Bus className="text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-white">HabeshaGo</span>
          </div>

          {/* Text */}
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold text-white mb-3">
              {slide.title}
            </h1>
            <p className="text-lg text-white/80 mb-2">{slide.subtitle}</p>
            <p className="text-white/70">{slide.description}</p>

            <div className="flex gap-3 mt-6">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-white"
                >
                  {f.icon}
                  {f.label}
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === slideIndex
                    ? "w-8 bg-white"
                    : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- RIGHT AUTH ---------------- */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-none border-none bg-background">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Welcome to HabeshaGo</CardTitle>
            <CardDescription>
              Book buses, manage trips, and travel smarter
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Button
              onClick={signInWithGoogle}
              variant="outline"
              className="w-full h-12 cursor-pointer"
              disabled={googlePending}
            >
              <FcGoogle className="mr-3 h-5 w-5" />
              Continue with Google
            </Button>

            <Button
              className="w-full h-12 bg-black text-white hover:bg-black/80 cursor-pointer"
              onClick={() => toast.info("TikTok login coming soon")}
            >
              <FaApple className="mr-3" />
              Continue with Apple
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">OR</span>
              </div>
            </div>

            <form onSubmit={submitEmail} className="space-y-4">
              <div>
                <Label>Email address</Label>
                <div className="relative mt-2">
                  <Input
                    ref={inputRef}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="h-12 pr-10"
                  />
                  {email && !email.includes("@") && (
                    <Sparkles className="absolute right-3 top-3.5 h-5 w-5 text-primary" />
                  )}
                </div>
                {emailError && (
                  <p className="text-sm text-destructive mt-1">{emailError}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12"
                disabled={emailPending}
              >
                {emailPending ? (
                  <>
                    <Loader className="animate-spin mr-2" />
                    Sending OTP
                  </>
                ) : (
                  <>
                    <Send className="mr-2" />
                    Continue
                  </>
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center">
              By continuing, you agree to HabeshaGo’s Terms & Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
