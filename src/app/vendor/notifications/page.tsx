"use client";

import { useSession } from "@/hooks/useSession";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CheckCheck, Package, ShoppingBag, DollarSign, Star, Sparkles, MessageSquare } from "lucide-react";
import { useVendorNotifications } from "@/hooks/useVendorNotifications";

const iconMap: Record<string, any> = {
  product: Package,
  order: ShoppingBag,
  withdrawal: DollarSign,
  review: Star,
  sponsorship: Sparkles,
  message: MessageSquare,
  default: Bell,
};

export default function VendorNotificationsPage() {
  const { data: session } = useSession();
  const { 
    notifications, 
    unreadCount, 
    isLoading: loading, 
    markAsRead, 
    markAllAsRead 
  } = useVendorNotifications();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={() => markAllAsRead()}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark All as Read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification: any) => {
                const Icon = iconMap[notification.type] || iconMap.default;
                return (
                  <div
                    key={notification.id}
                    className={`p-4 flex items-start gap-4 cursor-pointer hover:bg-muted/50 transition-colors ${!notification.read ? "bg-primary/5" : ""}`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className={`p-2 rounded-full ${!notification.read ? "bg-primary/10" : "bg-muted"}`}>
                      <Icon className={`h-5 w-5 ${!notification.read ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                      <div className="flex-1">
                        <p className={`${!notification.read ? "font-semibold" : ""}`}>{notification.message}</p>
                        {notification.type === 'withdrawal_approved' && notification.data?.proofImage && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Proof of Payment:</p>
                            <div className="relative w-40 h-24 rounded-md overflow-hidden border">
                              <img 
                                src={notification.data.proofImage} 
                                alt="Proof of Payment" 
                                className="object-cover w-full h-full cursor-zoom-in"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(notification.data.proofImage, '_blank');
                                }}
                              />
                            </div>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    {!notification.read && (
                      <Badge variant="secondary" className="text-xs">New</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">You're all caught up!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
