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
  CheckCircle,
  AlertCircle,
  Mail,
  X,
  Phone,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition, useCallback } from "react"
import { toast } from "sonner"
import { FcGoogle } from "react-icons/fc"
import { FaApple } from "react-icons/fa"
import { continueWithApple, register } from "@/services/auth.user.api"
import { AuthSlider } from "@/components/AuthSlider"
import { cn } from "@/lib/utils"
import { OAuthProvider, signInWithRedirect } from "firebase/auth"
import { auth } from "@/lib/firebase"

const COMMON_EMAIL_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "hotmail.com",
  "mail.com",
  "icloud.com",
  "protonmail.com",
  "aol.com",
  "yandex.com",
  "gmx.com",
]

const EMAIL_PROVIDERS = {
  gmail: { domain: "gmail.com", color: "text-red-500" },
  outlook: { domain: "outlook.com", color: "text-blue-500" },
  yahoo: { domain: "yahoo.com", color: "text-purple-500" },
  hotmail: { domain: "hotmail.com", color: "text-blue-400" },
  icloud: { domain: "icloud.com", color: "text-gray-500" },
}

const appleProvider = new OAuthProvider("apple.com")

export default function LoginPage() {
  const router = useRouter()

  const [googlePending, startGoogle] = useTransition()
  const [emailPending, startEmail] = useTransition()

  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isValidEmail, setIsValidEmail] = useState(false)
  const [touched, setTouched] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  // Generate email suggestions based on input
  const generateSuggestions = useCallback((value: string) => {
    if (!value || value.includes("@")) {
      const [localPart, domain] = value.split("@")

      // If user started typing domain, filter domains
      if (domain) {
        const filtered = COMMON_EMAIL_DOMAINS.filter((d) =>
          d.toLowerCase().startsWith(domain.toLowerCase()),
        ).map((d) => `${localPart}@${d}`)
        return filtered.slice(0, 5) // Limit to 5 suggestions
      }

      // If no @ yet, suggest common domains with the local part
      if (localPart && localPart.length > 1) {
        return COMMON_EMAIL_DOMAINS.map((d) => `${localPart}@${d}`).slice(0, 5)
      }
    }
    return []
  }, [])

  // Update suggestions when email changes
  useEffect(() => {
    if (email && !validateEmail(email) && !email.includes(" ")) {
      const newSuggestions = generateSuggestions(email)
      setSuggestions(newSuggestions)
      setShowSuggestions(newSuggestions.length > 0 && !isValidEmail)
      setIsValidEmail(validateEmail(email))

      // Clear error when user starts typing
      if (touched) setEmailError("")
    } else {
      setSuggestions([])
      setShowSuggestions(false)
      setIsValidEmail(validateEmail(email))
    }

    // Reset selected suggestion index
    setSelectedSuggestionIndex(-1)
  }, [email, generateSuggestions, isValidEmail, touched])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault()
          handleSuggestionClick(suggestions[selectedSuggestionIndex])
        }
        break
      case "Escape":
        setShowSuggestions(false)
        break
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setEmail(suggestion)
    setShowSuggestions(false)
    setTouched(true)

    // Auto-validate and submit? (optional)
    if (validateEmail(suggestion)) {
      // You could auto-submit here if desired
      // submitEmailWithValue(suggestion)
    }
  }

  const handleBlur = () => {
    setTouched(true)
    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email address")
    }

    // Delay hiding suggestions to allow click on suggestion
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false)
      }
    }, 200)
  }

  const clearEmail = () => {
    setEmail("")
    setEmailError("")
    setSuggestions([])
    setShowSuggestions(false)
    setIsValidEmail(false)
    inputRef.current?.focus()
  }

  const submitEmailWithValue = (emailValue: string) => {
    startEmail(async () => {
      const res = await register({ email: emailValue })
      if (!res.success) return
      toast.success("OTP sent to your email")
      router.push(`/verify-request?email=${emailValue}`)
    })
  }

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail(email)) {
      setEmailError("Enter a valid email address")
      return
    }

    submitEmailWithValue(email)
  }

  const signInWithGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`
  }

  const signInWithApple = async () => {
    const result = await signInWithRedirect(auth, appleProvider)

    const user = result.user

    const idToken = await user.getIdToken()

    // send token to backend
    continueWithApple(idToken)
  }

  // Get provider icon/color based on domain
  const getProviderInfo = (suggestion: string) => {
    const domain = suggestion.split("@")[1]
    const provider = Object.values(EMAIL_PROVIDERS).find(
      (p) => p.domain === domain,
    )
    return provider
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AuthSlider />

      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-none border-none bg-background">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-mozilla">
              Welcome to HabeshaGo
            </CardTitle>
            <CardDescription>
              Book buses, manage trips, and travel smarter
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              onClick={signInWithGoogle}
              variant="outline"
              className="w-full h-12 cursor-pointer hover:bg-muted transition-all"
              disabled={googlePending}
            >
              <FcGoogle className="mr-3 h-5 w-5" />
              Continue with Google
            </Button>

            <Button
              className="w-full h-12 bg-black text-white hover:bg-black/80 cursor-pointer transition-all"
              onClick={signInWithApple}
            >
              <FaApple className="mr-3 h-5 w-5" />
              Continue with Apple
            </Button>

            {/* Continue with Phone Button */}
            <Button
              onClick={() => router.push("/phone")}
              variant="outline"
              className="w-full h-12 cursor-pointer hover:bg-muted transition-all"
            >
              <Phone className="mr-3 h-5 w-5 text-primary" />
              Continue with Phone
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
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <div className="relative">
                  <div className="relative">
                    <Input
                      id="email"
                      ref={inputRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() =>
                        suggestions.length > 0 && setShowSuggestions(true)
                      }
                      onBlur={handleBlur}
                      placeholder="name@example.com"
                      className={cn(
                        "h-12 pr-20 transition-all",
                        isValidEmail &&
                          "border-green-200 focus-visible:ring-green-200",
                        emailError &&
                          "border-destructive focus-visible:ring-destructive",
                      )}
                      aria-invalid={!!emailError}
                      aria-describedby={emailError ? "email-error" : undefined}
                    />

                    {/* Status icons */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {isValidEmail && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {email && (
                        <button
                          type="button"
                          onClick={clearEmail}
                          className="p-1 hover:bg-muted rounded-full transition-colors"
                          aria-label="Clear email"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Email suggestions dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95"
                    >
                      <div className="p-2 border-b bg-muted/50">
                        <p className="text-xs text-muted-foreground">
                          Suggested email addresses
                        </p>
                      </div>
                      {suggestions.map((suggestion, index) => {
                        const provider = getProviderInfo(suggestion)
                        return (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            onMouseEnter={() =>
                              setSelectedSuggestionIndex(index)
                            }
                            className={cn(
                              "w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-muted transition-colors",
                              selectedSuggestionIndex === index && "bg-muted",
                            )}
                          >
                            <Mail
                              className={cn(
                                "h-3 w-3",
                                provider?.color || "text-muted-foreground",
                              )}
                            />
                            <span className="flex-1 font-medium text-sm">
                              {suggestion}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {suggestion.split("@")[1]}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Error message */}
                {emailError && (
                  <p
                    id="email-error"
                    className="text-sm text-destructive flex items-center gap-1 mt-1"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {emailError}
                  </p>
                )}

                {/* Quick domain selectors (optional) */}
                {!email && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <p className="text-xs text-muted-foreground w-full">
                      Quick select:
                    </p>
                    {Object.entries(EMAIL_PROVIDERS).map(
                      ([name, { domain, color }]) => (
                        <button
                          key={domain}
                          type="button"
                          onClick={() => setEmail(`yourname@${domain}`)}
                          className={cn(
                            "text-xs px-2 py-1 rounded-full border hover:bg-muted transition-colors",
                            color,
                          )}
                        >
                          {name}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 transition-all"
                disabled={emailPending || !isValidEmail}
              >
                {emailPending ? (
                  <>
                    <Loader className="animate-spin mr-2" />
                    Sending OTP
                  </>
                ) : (
                  <>
                    <Send className="mr-2" />
                    Continue with Email
                  </>
                )}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to HabeshaGo's{" "}
                <button
                  onClick={() => toast.info("Terms of Service")}
                  className="text-primary hover:underline"
                >
                  Terms
                </button>{" "}
                &{" "}
                <button
                  onClick={() => toast.info("Privacy Policy")}
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </button>
              </p>

              <p className="text-xs text-muted-foreground">
                Need help?{" "}
                <button
                  onClick={() => toast.info("Contact support")}
                  className="text-primary hover:underline"
                >
                  Contact Support
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
