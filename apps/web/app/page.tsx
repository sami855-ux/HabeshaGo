"use client"

import { ThemeToggle } from "@/components/themeToggle"
import { authClient } from "@/lib/auth-client"

export default function Home() {
  const { data: session, isPending: isLoading } = authClient.useSession()

  if (isLoading) {
    return <div className="">loading.....</div>
  }

  if (session) {
    return <div className="">There is session {session?.user.email}</div>
  }

  return (
    <div className="">
      <ThemeToggle />
    </div>
  )
}
