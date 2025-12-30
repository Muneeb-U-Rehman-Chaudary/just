import "./globals.css";
import { ReactNode } from "react";
import { VisualEditsMessenger } from "orchids-visual-edits";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { SessionProvider } from "@/contexts/SessionContext";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import { ReduxProvider } from "@/providers/redux-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Cart } from "@/components/Cart";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="3cc5654b-71f4-4824-aa21-e44da85ccea6"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <QueryProvider>
          <ReduxProvider>
            <SessionProvider>
              <NextTopLoader
                color="var(--primary)"
                initialPosition={0.08}
                crawlSpeed={200}
                height={5}
                crawl
                showSpinner={false}
                easing="ease"
                speed={200}
                shadow="0 0 10px var(--primary), 0 0 5px var(--primary)"
              />
              <Cart />
              {children}
              <Toaster position="top-right" richColors />
            </SessionProvider>
          </ReduxProvider>
        </QueryProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
