"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useSession as useSessionApi, useLogout } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SessionContextType {
  data: any;
  isLoading: boolean;
  logout: () => void;
  refetch: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, refetch } = useSessionApi();
  const logoutMutation = useLogout();
  const router = useRouter();

  const logout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push("/login");
      },
    });
  };

  return (
    <SessionContext.Provider value={{ data, isLoading, logout, refetch }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

export const logout = () => {
  // This is a placeholder for static access if needed, 
  // but usually we should use the hook version.
  if (typeof window !== 'undefined') {
    localStorage.removeItem("bearer_token");
    window.location.href = "/login";
  }
};
