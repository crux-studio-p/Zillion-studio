"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function ToastHandler() {
  const searchParams = useSearchParams();
  const shownErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!searchParams) return;
    
    const error = searchParams.get("error");
    if (error && error !== shownErrorRef.current) {
      if (error === "auth_failed") {
        toast.error("Authentication failed. Please try again.");
      } else if (error === "login_failed") {
        toast.error("Unable to connect to authentication provider.");
      }
      shownErrorRef.current = error;
      
      // Clean up the URL parameter natively to prevent Next.js router initialization errors
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  return null;
}
