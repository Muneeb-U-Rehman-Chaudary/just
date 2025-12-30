import { 
  useNotifications as useNotificationsQuery, 
  useMarkNotificationRead, 
  useMarkAllNotificationsRead,
  useDeleteNotification as useDeleteNotificationMutation 
} from "./useApi";

export function useNotifications(params?: any) {
  const { data, isLoading, error } = useNotificationsQuery(params);
  const markAsReadMutation = useMarkNotificationRead();
  const markAllAsReadMutation = useMarkAllNotificationsRead();
  const deleteNotificationMutation = useDeleteNotificationMutation();

    const notifications = data?.notifications || [];
    const unreadCount = data?.unreadCount ?? notifications.filter((n: any) => !n.read).length;

    return {
      notifications,
      unreadCount,
    pagination: data?.pagination || { total: 0, pages: 0, currentPage: 1 },
    isLoading,
    error,
    markAsRead: (id: string | number) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    deleteNotification: (id: string | number) => deleteNotificationMutation.mutate(id),
  };
}
