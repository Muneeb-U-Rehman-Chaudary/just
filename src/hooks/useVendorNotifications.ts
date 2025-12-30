import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useVendorNotifications() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["vendor-notifications"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
      if (!token) return { notifications: [], unreadCount: 0 };
      const response = await fetch("/api/vendor/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch vendor notifications");
      return response.json();
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/vendor/notifications/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to mark as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-notifications"] });
    },
  });

    const markAllAsRead = useMutation({
      mutationFn: async () => {
        const token = localStorage.getItem("bearer_token");
        const response = await fetch("/api/vendor/notifications", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ markAllAsRead: true }),
        });
        if (!response.ok) throw new Error("Failed to mark all as read");
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["vendor-notifications"] });
        toast.success("All notifications marked as read");
      },
    });

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    isLoading,
    error,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
  };
}
