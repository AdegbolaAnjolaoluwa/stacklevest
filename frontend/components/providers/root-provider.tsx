"use client";

import { useState, useEffect } from "react";
import { SplashScreen } from "@/components/ui/splash-screen";
import { OfflineScreen } from "@/components/offline-screen";

export function RootProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Initial check
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  
  const handleComplete = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && <SplashScreen onComplete={handleComplete} />}
      {isOffline && !isLoading && <OfflineScreen />}
      {children}
    </>
  );
}
