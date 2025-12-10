"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { authClient } from "@/lib/auth-client"
import { setUser } from "@/store/slices/userSlice"
import { getUserById } from "@/services/user"

export const useAuth = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const { data: session, isPending: loading } = authClient.useSession()
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetchAndSetUser = async () => {
      if (!session?.user) {
        if (!loading) router.replace("/")
        return
      }

      try {
        // Fetch full user data from backend
        const response = await getUserById(session.user.id)
        console.log(response)
        if (response.success && response.data) {
          dispatch(
            setUser({
              user: response.data,
              token:
                (session as any).token ||
                (session.session as any).accessToken ||
                "",
            })
          )
        } else {
          console.error("Failed to fetch full user:", response.message)
        }
      } catch (err) {
        console.error("Error fetching full user:", err)
      } finally {
        setFetching(false)
      }
    }

    fetchAndSetUser()
  }, [session, loading, dispatch, router])

  return { user: session?.user, loading: loading || fetching }
}
