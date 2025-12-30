import { toast } from "sonner";

export const logout = async () => {
  try {
    const token = localStorage.getItem("bearer_token");
    if (token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("bearer_token");
    toast.success("Logged out successfully");
    window.location.href = "/login";
  }
};
