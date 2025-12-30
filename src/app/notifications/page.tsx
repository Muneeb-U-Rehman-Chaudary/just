"use client";

import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  Package,
  ShoppingBag,
  DollarSign,
  Star,
  Trash2,
  CheckCheck,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useEffect } from "react";

export default function NotificationsPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const { 
    notifications, 
    unreadCount, 
    isLoading: notificationsLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/login");
    }
  }, [session, sessionLoading, router]);

  if (sessionLoading || notificationsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <Skeleton className="h-10 w-48" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "admin_warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "admin_message":
        return <Info className="h-5 w-5 text-blue-600" />;
      case "order":
        return <ShoppingBag className="h-5 w-5 text-green-600" />;
      case "product":
        return <Package className="h-5 w-5 text-purple-600" />;
      case "review":
        return <Star className="h-5 w-5 text-yellow-500" />;
      case "withdrawal":
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getNotificationStyle = (type: string, read: boolean) => {
    const baseStyle = read ? "opacity-75" : "";
    switch (type) {
      case "admin_warning":
        return `border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 ${baseStyle}`;
      case "admin_message":
        return `border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 ${baseStyle}`;
      default:
        return baseStyle;
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-muted-foreground">
                  {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllAsRead} className="gap-2">
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification: any) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${getNotificationStyle(
                    notification.type,
                    notification.read
                  )}`}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                    if (notification.link) {
                      router.push(notification.link);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            {(notification.type === "admin_warning" ||
                              notification.type === "admin_message") && (
                              <Badge
                                variant={
                                  notification.type === "admin_warning"
                                    ? "destructive"
                                    : "default"
                                }
                                className={
                                  notification.type === "admin_warning"
                                    ? "bg-yellow-600 mb-2"
                                    : "mb-2"
                                }
                              >
                                {notification.type === "admin_warning"
                                  ? "Admin Warning"
                                  : "Admin Message"}
                              </Badge>
                            )}
                            <p
                              className={`${
                                notification.read
                                  ? "text-muted-foreground"
                                  : "font-medium"
                              }`}
                            >
                              {notification.message}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Bell className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No notifications yet</p>
              <p className="text-sm mt-2">
                You'll see updates about your orders, products, and activities here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
