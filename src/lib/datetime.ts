/**
 * Utility functions for date and time handling across the application.
 * Default timezone for MAJIKU operations is Western Indonesia Time (WIB, UTC+7).
 */

export function todayInWib(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(date);
}

export function timeInWib(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function isValidDateString(val?: string | null): boolean {
  if (!val || typeof val !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(val) && !isNaN(Date.parse(val));
}
