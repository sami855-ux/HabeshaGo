"use client"

import { ThemeToggle } from "@/components/themeToggle"
import { authClient } from "@/lib/auth-client"

export default function Home() {
  const { data: session, isPending: isLoading } = authClient.useSession()

  if (isLoading) {
    return <div className="">loading.....</div>
  }
  return (
    <div className="">
      <ThemeToggle />
      {session ? <p>{session.user.name}</p> : <p>No user </p>}
    </div>
  )
}
