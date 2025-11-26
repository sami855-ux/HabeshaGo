"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { authClient } from "@/lib/auth-client"
import { Loader } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useState, useTransition } from "react"
import { toast } from "sonner"

function VerifyPage() {
  const params = useSearchParams()
  const router = useRouter()

  const [otp, setOtp] = useState("")
  const [verifyPending, startTransition] = useTransition()

  const email = params.get("email") as string
  const isOtpCompleted = otp.length === 6

  const verifyAccount = () => {
    startTransition(async () => {
      await authClient.signIn.emailOtp({
        email,
        otp,
        fetchOptions: {
          onSuccess: () => {
            toast.success("Account Verified successfully")
            router.push("/")
          },
          onError: () => {
            toast.error("Error while verifying Account")
          },
        },
      })
    })
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Please check your email</CardTitle>
        <CardDescription>
          We have sent a verification email code to your email address. Please
          open the email and paste the code below
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
            className="gap-2"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <p className="text-sm text-muted-foreground pt-2">
            Enter the 6-digit code sent to your email
          </p>
        </div>
        <Button
          className="w-full "
          disabled={verifyPending || !isOtpCompleted}
          onClick={verifyAccount}
        >
          {verifyPending ? (
            <>
              <Loader className="animate-spin mr-2 size-4" />
              Verifying ....
            </>
          ) : (
            <>Verify Account</>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export default VerifyPage
