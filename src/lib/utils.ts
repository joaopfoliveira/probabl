import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get today's date in ISO format (yyyy-MM-dd) for Lisbon timezone
 */
export function getTodayDateISO(): string {
  const now = new Date();
  // Convert to Lisbon timezone (Europe/Lisbon)
  const lisbonTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Lisbon" }));
  return format(lisbonTime, 'yyyy-MM-dd');
}
