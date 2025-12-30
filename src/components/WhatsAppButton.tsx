"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface WhatsAppButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function WhatsAppButton({ variant = "outline", size = "default", className = "" }: WhatsAppButtonProps) {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    fetchWhatsAppSettings();
  }, []);

  const fetchWhatsAppSettings = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/admin/settings", {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        const whatsappSettings = data.settings?.whatsapp;
        if (whatsappSettings) {
          setEnabled(whatsappSettings.enabled);
          setWhatsappNumber(whatsappSettings.phoneNumber);
        }
      }
    } catch (error) {
      console.error("Error fetching WhatsApp settings:", error);
    }
  };

  const handleWhatsAppClick = () => {
    if (!whatsappNumber || !enabled) return;
    
    // Remove any non-numeric characters except +
    const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}`;
    
    // Handle iframe compatibility
    const isInIframe = window.self !== window.top;
    if (isInIframe) {
      window.parent.postMessage(
        { type: "OPEN_EXTERNAL_URL", data: { url: whatsappUrl } },
        "*"
      );
    } else {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (!enabled || !whatsappNumber) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleWhatsAppClick}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      WhatsApp
    </Button>
  );
}