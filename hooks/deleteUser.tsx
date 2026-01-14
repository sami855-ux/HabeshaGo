import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteUser } from "@/services/user.api"
import { toast } from "sonner"

/**
 * Custom hook to delete a user
 * Provides a mutate function and mutation states
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["all_users"],
      })

      toast.success("User deleted successfully")
    },
    onError: (error: any) => {
      console.error("Failed to delete user:", error)
      toast.error("Failed to delete user")
    },
  })

  return mutation
}
