import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getApiUrl() {
  if (typeof window === "undefined") return "http://localhost:8080"; // Server-side fallback
  
  // Use current window hostname but different port
  // This allows it to work on any local IP (192.168.x.x) or localhost
  return `http://${window.location.hostname}:8080`;
}
