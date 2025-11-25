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
import { GithubIcon, Globe, Loader, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

function LoginPage() {
  const router = useRouter()

  const [githubPending, startGithubTransition] = useTransition()
  const [emailPending, startEmailTransition] = useTransition()
  const [email, setEmail] = useState("")

  console.log("Auth baseURL:", authClient.config.baseURL)

  async function signUnWithGithub() {
    startGithubTransition(async () => {
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
    await authClient.signIn.social({
      provider: "google",
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
  }

  function signinWithEmail() {
    startEmailTransition(async () => {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Email sent")
            router.push(`/verify-request`)
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
        <CardDescription>Login with your Github Email Account</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Button
          onClick={signUnWithGithub}
          className="w-full font-geist cursor-pointer"
          variant={"outline"}
          disabled={githubPending}
        >
          {githubPending ? (
            <>
              <Loader className="animate-spin mr-2 size-4" />
              Loading ....
            </>
          ) : (
            <>
              <GithubIcon className="w-4 h-4"></GithubIcon>
              Sigin in with Github
            </>
          )}
        </Button>

        <Button className="w-full cursor-pointer" variant={"outline"}>
          <Globe className="w-4 h-4"></Globe>
          Sigin in with Google
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
