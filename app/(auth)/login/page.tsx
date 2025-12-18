"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Loader,
  Send,
  Mail,
  Sparkles,
  Check,
  Phone,
  HelpCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition, useEffect, useRef } from "react"
import { toast } from "sonner"
import { FcGoogle } from "react-icons/fc"
import { FaApple, FaGithub } from "react-icons/fa"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Common email domains for suggestions
const COMMON_EMAIL_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "hotmail.com",
  "icloud.com",
  "aol.com",
  "protonmail.com",
  "zoho.com",
  "mail.com",
  "yandex.com",
]

function LoginPage() {
  const router = useRouter()

  const [applePending, startAppleTransition] = useTransition()
  const [googlePending, startGoogleTransition] = useTransition()
  const [githubPending, startGithubTransition] = useTransition()
  const [emailPending, startEmailTransition] = useTransition()

  const [email, setEmail] = useState("")
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false)
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([])
  const [emailError, setEmailError] = useState("")
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [showPhoneTooltip, setShowPhoneTooltip] = useState(false)
  const [activeHelp, setActiveHelp] = useState<"email" | "phone" | null>(null)

  const emailInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const phoneButtonRef = useRef<HTMLButtonElement>(null)

  // Prevent body scroll when suggestions are shown
  useEffect(() => {
    if (showEmailSuggestions) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [showEmailSuggestions])

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        emailInputRef.current &&
        !emailInputRef.current.contains(event.target as Node)
      ) {
        setShowEmailSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }

      // Close phone tooltip if clicking outside
      if (
        phoneButtonRef.current &&
        !phoneButtonRef.current.contains(event.target as Node) &&
        showPhoneTooltip
      ) {
        setShowPhoneTooltip(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showPhoneTooltip])

  // Generate email suggestions
  useEffect(() => {
    if (!email.includes("@") && email.length > 0) {
      const suggestions = COMMON_EMAIL_DOMAINS.map(
        (domain) => `${email}@${domain}`
      )
      setEmailSuggestions(suggestions)
      setShowEmailSuggestions(true)
      setSelectedSuggestionIndex(-1)
    } else {
      setShowEmailSuggestions(false)
    }
  }, [email])

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Handle email suggestion click
  const handleEmailSuggestionClick = (suggestedEmail: string) => {
    setEmail(suggestedEmail)
    setShowEmailSuggestions(false)
    setSelectedSuggestionIndex(-1)
    setEmailError("")
    emailInputRef.current?.focus()
  }

  // Handle keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showEmailSuggestions || emailSuggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) =>
          prev < emailSuggestions.length - 1 ? prev + 1 : 0
        )
        break

      case "ArrowUp":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : emailSuggestions.length - 1
        )
        break

      case "Enter":
        e.preventDefault()
        if (
          selectedSuggestionIndex >= 0 &&
          selectedSuggestionIndex < emailSuggestions.length
        ) {
          handleEmailSuggestionClick(emailSuggestions[selectedSuggestionIndex])
        }
        break

      case "Escape":
        e.preventDefault()
        setShowEmailSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break

      case "Tab":
        setShowEmailSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)

    if (value && !validateEmail(value) && value.includes("@")) {
      setEmailError("Please enter a valid email address")
    } else {
      setEmailError("")
    }
  }

  // Handle phone login
  const handlePhoneLogin = () => {
    setShowPhoneTooltip(true)
    setTimeout(() => {
      router.push("/phone")
    }, 1000)
  }

  async function signInWithGithub() {}

  async function signInWithGoogle() {}

  async function signInWithApple() {}

  function signInWithEmail() {
    // Validate email
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md mx-auto border shadow-lg">
        <CardHeader className="space-y-2 pb-4">
          <CardTitle className="text-2xl text-center font-semibold">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a one-time passcode
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Social Login Buttons - Grid Layout */}
          <div className="grid grid-cols-2 gap-3">
            {/* Google Button - Full width */}
            <Button
              onClick={signInWithGoogle}
              className="w-full font-medium h-11 col-span-2"
              variant="outline"
              disabled={googlePending}
            >
              {googlePending ? (
                <Loader className="animate-spin size-4" />
              ) : (
                <div className="flex items-center justify-center w-full cursor-pointer">
                  <FcGoogle className="w-5 h-5 mr-3" />
                  <span>Google</span>
                </div>
              )}
            </Button>

            {/* Apple Button - Primary Style */}
            <Button
              onClick={signInWithApple}
              className="w-full font-medium h-11"
              variant="default"
              disabled={applePending}
            >
              {applePending ? (
                <Loader className="animate-spin size-4" />
              ) : (
                <div className="flex items-center justify-center w-full cursor-pointer">
                  <FaApple className="w-5 h-5 mr-3" />
                  <span>Apple</span>
                </div>
              )}
            </Button>

            {/* Phone Button - Secondary Style */}
            <Button
              ref={phoneButtonRef}
              onClick={handlePhoneLogin}
              className="w-full font-medium h-11"
              variant="secondary"
            >
              <div className="flex items-center justify-center w-full cursor-pointer">
                <Phone className="w-5 h-5 mr-3" />
                <span>Phone</span>
              </div>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center z-10">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm z-50">
              <span className="px-3 text-muted-foreground bg-card">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email Login */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() =>
                          setActiveHelp(activeHelp === "email" ? null : "email")
                        }
                      >
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enter your email to receive a one-time passcode</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="relative" ref={suggestionsRef}>
                <Input
                  ref={emailInputRef}
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (email && !email.includes("@")) {
                      setShowEmailSuggestions(true)
                    }
                  }}
                  className={`pr-10 ${emailError ? "border-destructive" : ""}`}
                  required
                />
                {email && !email.includes("@") && (
                  <Sparkles className="absolute right-3 top-3 h-4 w-4 text-primary" />
                )}

                {/* Email Suggestions Dropdown */}
                {showEmailSuggestions && emailSuggestions.length > 0 && (
                  <>
                    {/* Overlay to prevent background scrolling */}
                    <div
                      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                      onClick={() => setShowEmailSuggestions(false)}
                    />

                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-80 overflow-y-auto">
                      <div className="px-3 py-2 border-b bg-muted/50 sticky top-0">
                        <p className="text-xs text-muted-foreground">
                          Press ↑↓ to navigate • Enter to select • Esc to close
                        </p>
                      </div>
                      {emailSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center justify-between ${
                            index === selectedSuggestionIndex
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent hover:text-accent-foreground"
                          }`}
                          onClick={() => handleEmailSuggestionClick(suggestion)}
                          onMouseEnter={() => setSelectedSuggestionIndex(index)}
                        >
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span>{suggestion}</span>
                          </div>
                          {index === selectedSuggestionIndex && (
                            <Check className="w-3 h-3" />
                          )}
                        </button>
                      ))}
                      <div className="px-3 py-2 border-t bg-muted/50 sticky bottom-0">
                        <p className="text-xs text-muted-foreground">
                          {emailSuggestions.length} email suggestions
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {emailError && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}
            </div>

            <Button
              className="w-full cursor-pointer h-11"
              onClick={signInWithEmail}
              disabled={emailPending}
            >
              {emailPending ? (
                <>
                  <Loader className="animate-spin mr-2 size-4" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send OTP
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
