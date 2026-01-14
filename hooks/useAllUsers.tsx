import { useQuery } from "@tanstack/react-query"
import type { User } from "@/types/user"
import { getAllUsers } from "@/services/user.api"

/**
 * Custom hook to fetch all users
 * Returns data, loading state, and error state
 */
export const useUsers = () => {
  return useQuery<User[], Error>({
    queryKey: ["all_users"],
    queryFn: getAllUsers,
  })
}
