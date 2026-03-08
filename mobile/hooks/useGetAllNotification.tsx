import { axiosInstance } from "@/service/axiosInstance"
import { fetchAllNotification } from "@/service/notification.api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useNotificationQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => fetchAllNotification(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // retry once on failure
    enabled: !!userId,
  })
}

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await axiosInstance.patch(
        `/api/notifications/${notificationId}/read`,
      )

      return response
    },
    onMutate: async (notificationId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications"] })

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueryData(["notifications"])

      // Optimistically update the cache
      queryClient.setQueryData(["notifications"], (old: any) => {
        if (!old) return old

        return {
          ...old,
          notifications: old.notifications?.map((n: Notification) =>
            n.id === notificationId
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n,
          ),
          unreadCount: Math.max((old.unreadCount || 0) - 1, 0),
        }
      })

      return { previousNotifications }
    },
    onError: (err, notificationId, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ["notifications"],
          context.previousNotifications,
        )
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(
        `/api/notifications/mark-all-read?userId=${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          error.message || "Failed to mark all notifications as read",
        )
      }

      return response.json()
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] })

      const previousNotifications = queryClient.getQueryData(["notifications"])

      // Optimistically mark all as read
      queryClient.setQueryData(["notifications"], (old: any) => {
        if (!old) return old

        return {
          ...old,
          notifications: old.notifications?.map((n: Notification) => ({
            ...n,
            isRead: true,
            readAt: n.isRead ? n.readAt : new Date().toISOString(),
          })),
          unreadCount: 0,
        }
      })

      return { previousNotifications }
    },
    onError: (err, userId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ["notifications"],
          context.previousNotifications,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export const useDeleteNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await axiosInstance.delete(
        `/notification/${notificationId}`,
      )

      return response
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] })

      const previousNotifications = queryClient.getQueryData(["notifications"])

      // Optimistically remove from cache
      queryClient.setQueryData(["notifications"], (old: any) => {
        if (!old) return old

        const notificationToDelete = old.notifications?.find(
          (n: Notification) => n.id === notificationId,
        )
        const wasUnread = notificationToDelete?.isRead === false

        return {
          ...old,
          notifications: old.notifications?.filter(
            (n: Notification) => n.id !== notificationId,
          ),
          total: (old.total || 0) - 1,
          unreadCount: wasUnread
            ? Math.max((old.unreadCount || 0) - 1, 0)
            : old.unreadCount,
        }
      })

      return { previousNotifications }
    },
    onError: (err, notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ["notifications"],
          context.previousNotifications,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(
        `/api/notifications/clear-all?userId=${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to clear all notifications")
      }

      return response.json()
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] })

      const previousNotifications = queryClient.getQueryData(["notifications"])

      // Optimistically clear all
      queryClient.setQueryData(["notifications"], (old: any) => {
        if (!old) return old

        return {
          ...old,
          notifications: [],
          total: 0,
          unreadCount: 0,
        }
      })

      return { previousNotifications }
    },
    onError: (err, userId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ["notifications"],
          context.previousNotifications,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}
