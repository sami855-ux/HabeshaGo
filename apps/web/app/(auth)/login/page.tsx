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
import { authClient } from "@/lib/auth-client"
import { Loader, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { FcGoogle } from "react-icons/fc"
import { FaApple } from "react-icons/fa"

function LoginPage() {
  const router = useRouter()

  const [applePending, startAppleTransition] = useTransition()
  const [googlePending, startGoogleTransition] = useTransition()
  const [emailPending, startEmailTransition] = useTransition()
  const [email, setEmail] = useState("")

  async function signUnWithGithub() {
    startAppleTransition(async () => {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed in with Github, you will be redircted....")
          },
          onError: (error) => {
            console.log(error)
            toast.error("Internal server error")
          },
        },
      })
    })
  }

  async function signUnWithGoogle() {
    startGoogleTransition(async () => {
      try {
        await authClient.signIn.social({
          provider: "google",
          callbackURL: "/",

          fetchOptions: {
            onSuccess: () => {
              toast.success("Signed in with Google, you will be redirected...")
            },
            onError: (error) => {
              console.error("Google sign-in error:", error)
              toast.error("Internal server error")
            },
          },
        })
      } catch (err) {
        console.error("Unexpected Google login failure:", err)
        toast.error("Failed to sign in. Please try again.")
      }
    })
  }

  function signinWithEmail() {
    startEmailTransition(async () => {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Email sent successfully")
            router.push(`/verify-request?email=${email}`)
          },
          onError: () => {
            toast.error("Error sending email")
          },
        },
      })
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome back!</CardTitle>
        <CardDescription>
          Login with your Google or Apple Account
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Button
          onClick={signUnWithGoogle}
          className="w-full font-geist cursor-pointer"
          variant={"outline"}
          disabled={googlePending}
        >
          {googlePending ? (
            <>
              <Loader className="animate-spin mr-2 size-4" />
              Loading ....
            </>
          ) : (
            <>
              <FcGoogle className="w-4 h-4"></FcGoogle>
              Sigin in with Google
            </>
          )}
        </Button>

        <Button
          onClick={signUnWithGithub}
          className="w-full font-geist cursor-pointer"
          variant={"outline"}
          disabled={applePending}
        >
          {applePending ? (
            <>
              <Loader className="animate-spin mr-2 size-4" />
              Loading ....
            </>
          ) : (
            <>
              <FaApple className="w-4 h-4"></FaApple>
              Sigin in with Apple
            </>
          )}
        </Button>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border pt-1">
          <span className="relative z-10 bg-card px-2  text-muted-foreground ">
            Or continue with
          </span>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              placeholder="example@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            className="cursor-pointer"
            onClick={signinWithEmail}
            disabled={emailPending}
          >
            {emailPending ? (
              <>
                <Loader className="animate-spin mr-2 size-4" />
                Loading ....
              </>
            ) : (
              <>
                <Send className="w-4 h-4"></Send>
                Continue with Email
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoginPage
