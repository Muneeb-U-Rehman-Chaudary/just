import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("bearer_token");
  }
  return null;
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  return response.json();
};

const buildQueryString = (params?: Record<string, any>) => {
  if (!params) return "";
  const filteredParams = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "" && v !== "all")
    .map(([k, v]) => [k, String(v)]);
  
  if (filteredParams.length === 0) return "";
  return "?" + new URLSearchParams(filteredParams).toString();
};

// --- Products ---

export function useProducts(params?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
  vendorId?: string | number;
  status?: string;
}) {
  const queryString = buildQueryString(params);

  return useQuery({
    queryKey: ["products", params],
    queryFn: () => fetchWithAuth(`/api/products${queryString}`),
  });
}

export function useProduct(id: string | number) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchWithAuth(`/api/products/${id}`),
    enabled: !!id,
  });
}

// --- Vendors ---

export function useVendors() {
  return useQuery({
    queryKey: ["vendors"],
    queryFn: () => fetchWithAuth("/api/vendors"),
  });
}

export function useVendor(id: string | number) {
  return useQuery({
    queryKey: ["vendor", id],
    queryFn: () => fetchWithAuth(`/api/vendors/${id}`),
    enabled: !!id,
  });
}

// --- Orders ---

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => fetchWithAuth("/api/orders"),
    enabled: !!getToken(),
  });
}

export function useOrder(id: string | number) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchWithAuth(`/api/orders/${id}`),
    enabled: !!id && !!getToken(),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderData: any) =>
      fetchWithAuth("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Order placed successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// --- Reviews ---

export function useReviews(productId?: string | number) {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => fetchWithAuth(`/api/reviews${productId ? `?productId=${productId}` : ""}`),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewData: { productId: number; rating: number; comment: string }) =>
      fetchWithAuth("/api/reviews", {
        method: "POST",
        body: JSON.stringify(reviewData),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
      toast.success("Review submitted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// --- Vendor Panel ---

export function useVendorDashboard() {
  return useQuery({
    queryKey: ["vendor-dashboard"],
    queryFn: () => fetchWithAuth("/api/vendor/dashboard"),
    enabled: !!getToken(),
  });
}

export function useVendorProducts(params?: any) {
  const queryString = buildQueryString(params);
  return useQuery({
    queryKey: ["vendor-products", params],
    queryFn: () => fetchWithAuth(`/api/vendor/products${queryString}`),
    enabled: !!getToken(),
  });
}

export function useVendorOrders(params?: any) {
  const queryString = buildQueryString(params);
  return useQuery({
    queryKey: ["vendor-orders", params],
    queryFn: () => fetchWithAuth(`/api/vendor/orders${queryString}`),
    enabled: !!getToken(),
  });
}

export function useVendorStats() {
  return useQuery({
    queryKey: ["vendor-stats"],
    queryFn: () => fetchWithAuth("/api/vendor/stats"),
    enabled: !!getToken(),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productData: any) =>
      fetchWithAuth("/api/products", {
        method: "POST",
        body: JSON.stringify(productData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      toast.success("Product created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...productData }: any) =>
      fetchWithAuth(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(productData),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      toast.success("Product updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchWithAuth(`/api/products/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      toast.success("Product deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useVendorWithdrawals() {
  return useQuery({
    queryKey: ["withdrawals"],
    queryFn: () => fetchWithAuth("/api/withdrawals"),
    enabled: !!getToken(),
  });
}

// --- Admin Panel ---

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchWithAuth("/api/admin/stats"),
    enabled: !!getToken(),
  });
}

export function useAdminRevenue() {
  return useQuery({
    queryKey: ["admin-revenue"],
    queryFn: () => fetchWithAuth("/api/admin/revenue"),
    enabled: !!getToken(),
  });
}

export function useAdminUsers(params?: any) {
  const queryString = buildQueryString(params);
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => fetchWithAuth(`/api/admin/users${queryString}`),
    enabled: !!getToken(),
  });
}

export function useAdminProducts(params?: any) {
  const queryString = buildQueryString(params);
  return useQuery({
    queryKey: ["admin-products", params],
    queryFn: () => fetchWithAuth(`/api/admin/products${queryString}`),
    enabled: !!getToken(),
  });
}

export function useAdminOrders(params?: any) {
  const queryString = buildQueryString(params);
  return useQuery({
    queryKey: ["admin-orders", params],
    queryFn: () => fetchWithAuth(`/api/admin/orders${queryString}`),
    enabled: !!getToken(),
  });
}

export function useAdminVendors(params?: any) {
  const queryString = buildQueryString(params);
  return useQuery({
    queryKey: ["admin-vendors", params],
    queryFn: () => fetchWithAuth(`/api/admin/vendors${queryString}`),
    enabled: !!getToken(),
  });
}

export function useAdminWithdrawals(params?: any) {
  const queryString = buildQueryString(params);
  return useQuery({
    queryKey: ["admin-withdrawals", params],
    queryFn: () => fetchWithAuth(`/api/admin/withdrawals${queryString}`),
    enabled: !!getToken(),
  });
}

export function useAdminSponsors(params?: any) {
  const queryString = buildQueryString(params);
  return useQuery({
    queryKey: ["admin-sponsors", params],
    queryFn: () => fetchWithAuth(`/api/admin/sponsors${queryString}`),
    enabled: !!getToken(),
  });
}

export function useAdminSponsorRequests(params?: any) {
  const queryString = buildQueryString(params);
  return useQuery({
    queryKey: ["admin-sponsor-requests", params],
    queryFn: () => fetchWithAuth(`/api/admin/sponsors/requests${queryString}`),
    enabled: !!getToken(),
  });
}

export function useApproveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchWithAuth(`/api/admin/products/${id}/approve`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product approved!");
    },
  });
}

export function useRejectProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      fetchWithAuth(`/api/admin/products/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product rejected!");
    },
  });
}

export function useAdminUser(id: string | number) {
  return useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => fetchWithAuth(`/api/admin/users/${id}`),
    enabled: !!id && !!getToken(),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...userData }: any) =>
      fetchWithAuth(`/api/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      fetchWithAuth(`/api/admin/users/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      fetchWithAuth(`/api/admin/users/${id}/ban`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User banned!");
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchWithAuth(`/api/admin/users/${id}/unban`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User unbanned!");
    },
  });
}

export function useApproveWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, proofImage }: { id: number; proofImage?: string }) =>
      fetchWithAuth(`/api/admin/withdrawals/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ proofImage }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      toast.success("Withdrawal approved!");
    },
  });
}

export function useRejectWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      fetchWithAuth(`/api/admin/withdrawals/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      toast.success("Withdrawal rejected!");
    },
  });
}

export function useApproveSponsorRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchWithAuth(`/api/admin/sponsors/requests/${id}/approve`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsor-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-sponsors"] });
      toast.success("Sponsor request approved!");
    },
  });
}

export function useRejectSponsorRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      fetchWithAuth(`/api/admin/sponsors/requests/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsor-requests"] });
      toast.success("Sponsor request rejected!");
    },
  });
}

export function useSponsorVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string | number; tier: string; duration: number; type: string }) =>
      fetchWithAuth(`/api/admin/vendors/${id}/sponsor`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-sponsors"] });
      toast.success("Vendor sponsored successfully!");
    },
  });
}

export function useRemoveSponsorVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) =>
      fetchWithAuth(`/api/admin/sponsors/${id}/remove`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-sponsors"] });
      toast.success("Sponsorship removed");
    },
  });
}

// --- Notifications ---

export function useNotifications(params?: any) {
  const queryString = buildQueryString(params);
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => fetchWithAuth(`/api/notifications${queryString}`),
    enabled: !!getToken(),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) =>
      fetchWithAuth(`/api/notifications/${id}`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchWithAuth("/api/notifications", { 
        method: "PUT", 
        body: JSON.stringify({ markAllAsRead: true }) 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) =>
      fetchWithAuth(`/api/notifications/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification deleted");
    },
  });
}

export function useVendorNotifications(params?: any) {
  const queryString = buildQueryString(params);
  return useQuery({
    queryKey: ["vendor-notifications", params],
    queryFn: () => fetchWithAuth(`/api/vendor/notifications${queryString}`),
    enabled: !!getToken(),
  });
}

export function useMarkVendorNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) =>
      fetchWithAuth(`/api/vendor/notifications/${id}`, { method: "PUT" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-notifications"] });
    },
  });
}

export function useMarkVendorAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchWithAuth("/api/vendor/notifications", { 
        method: "PATCH", 
        body: JSON.stringify({ markAllAsRead: true }) 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-notifications"] });
    },
  });
}

export function useAdminNotificationsList(params?: any) {
  const queryString = buildQueryString(params);
  return useQuery({
    queryKey: ["admin-notifications-list", params],
    queryFn: () => fetchWithAuth(`/api/admin/notifications${queryString}`),
    enabled: !!getToken(),
  });
}

export function useMarkAdminAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId?: string) =>
      fetchWithAuth("/api/admin/notifications", { 
        method: "PATCH", 
        body: JSON.stringify({ markAllAsRead: true, userId }) 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications-list"] });
    },
  });
}

// --- Cart ---

export function useCartData() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: () => fetchWithAuth("/api/cart"),
    enabled: !!getToken(),
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) =>
      fetchWithAuth("/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) =>
      fetchWithAuth(`/api/cart?productId=${productId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Removed from cart");
    },
  });
}

// --- Auth ---

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: { email: string; password: string; rememberMe?: boolean }) =>
      fetchWithAuth("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (userData: { name: string; email: string; password: string; role?: string }) =>
      fetchWithAuth("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      }),
  });
}

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => fetchWithAuth("/api/auth/session"),
    retry: false,
    enabled: !!getToken(),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchWithAuth("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      localStorage.removeItem("bearer_token");
      queryClient.clear();
      toast.success("Logged out successfully");
    },
  });
}

// --- Settings ---

export function useGlobalSettings() {
  return useQuery({
    queryKey: ["global-settings"],
    queryFn: () => fetchWithAuth("/api/admin/settings"),
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { category: string; settings: any }) =>
      fetchWithAuth("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global-settings"] });
      toast.success("Settings updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateAdminProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      fetchWithAuth("/api/admin/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useVendorProfileUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      fetchWithAuth("/api/vendor/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-profile"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success("Settings updated");
    },
  });
}

export function useWithdrawalRequests() {
  return useQuery({
    queryKey: ["withdrawals"],
    queryFn: () => fetchWithAuth("/api/withdrawals"),
    enabled: !!getToken(),
  });
}

export function useAdminContactsList(params?: any) {
  const queryString = buildQueryString(params);
  return useQuery({
    queryKey: ["admin-contacts", params],
    queryFn: () => fetchWithAuth(`/api/admin/contact${queryString}`),
    enabled: !!getToken(),
  });
}

export function useAdminContact(id: string | number) {
  return useQuery({
    queryKey: ["admin-contact", id],
    queryFn: () => fetchWithAuth(`/api/admin/contact/${id}`),
    enabled: !!id && !!getToken(),
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => fetchWithAuth("/api/admin/analytics"),
    enabled: !!getToken(),
  });
}

export function useDeleteAdminContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) =>
      fetchWithAuth(`/api/admin/contact/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      toast.success("Message deleted successfully");
    },
  });
}

export function useReplyToContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reply }: { id: string | number; reply: string }) =>
      fetchWithAuth(`/api/admin/contact/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ reply }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      toast.success("Reply sent successfully");
    },
  });
}

export function useMessageUser() {
  return useMutation({
    mutationFn: ({ userId, subject, content }: { userId: string | number; subject: string; content: string }) =>
      fetchWithAuth(`/api/admin/users/${userId}/message`, {
        method: "POST",
        body: JSON.stringify({ subject, message: content }),
      }),
    onSuccess: () => {
      toast.success("Message sent to user");
    },
  });
}

export function useVendorSponsorRequests() {
  return useQuery({
    queryKey: ["vendor-sponsorship"],
    queryFn: () => fetchWithAuth("/api/vendor/sponsorship"),
    enabled: !!getToken(),
  });
}

export function useWithdrawVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { amount: number; method: string; bankDetails: string }) =>
      fetchWithAuth("/api/withdrawals", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-stats"] });
      toast.success("Withdrawal request submitted");
    },
  });
}

export function useVendorProfile() {
  return useQuery({
    queryKey: ["vendor-profile"],
    queryFn: () => fetchWithAuth("/api/vendor/profile"),
    enabled: !!getToken(),
  });
}

export function useCreateSponsorRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { type: string; productId?: string; tier: string; message?: string }) =>
      fetchWithAuth("/api/vendor/sponsorship", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-sponsorship"] });
      toast.success("Sponsorship request submitted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
