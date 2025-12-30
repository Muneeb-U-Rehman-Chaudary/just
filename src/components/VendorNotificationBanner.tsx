"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, CheckCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  type: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: Date;
}

interface VendorNotificationBannerProps {
  vendorId?: string;
  className?: string;
}

export function VendorNotificationBanner({ vendorId, className }: VendorNotificationBannerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dismissedNotifications, setDismissedNotifications] = useState<number[]>([]);

  useEffect(() => {
    if (vendorId) {
      fetchNotifications();
    }
  }, [vendorId]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/vendor/notifications?unreadOnly=true&limit=5", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("bearer_token");
      await fetch("/api/vendor/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });

      setDismissedNotifications([...dismissedNotifications, notificationId]);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error("Error dismissing notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      await fetch("/api/vendor/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  if (loading || notifications.length === 0) {
    return null;
  }

  const visibleNotifications = notifications.filter(
    n => !dismissedNotifications.includes(n.id)
  );

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3 mb-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="default" className="gradient-bg">
              {unreadCount} new
            </Badge>
          )}
        </div>
        {notifications.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark all as read
          </Button>
        )}
      </div>

      {visibleNotifications.map((notification) => (
        <Alert
          key={notification.id}
          className={cn(
            "relative border-l-4",
            notification.type === "sponsorship_approved" && "border-l-green-500",
            notification.type === "sponsorship_rejected" && "border-l-red-500",
            notification.type === "sponsorship_expiring" && "border-l-yellow-500",
            notification.type === "product_approved" && "border-l-blue-500"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => handleDismiss(notification.id)}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <AlertDescription className="pr-8">
            <p className="text-sm">{notification.message}</p>
            {notification.link && (
              <Link href={notification.link}>
                <Button variant="link" size="sm" className="px-0 h-auto mt-2">
                  View Details →
                </Button>
              </Link>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
