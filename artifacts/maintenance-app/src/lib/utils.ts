import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  if (!date) return "";
  return format(parseISO(date), "MMM d, yyyy")
}

export function formatDateTime(date: string) {
  if (!date) return "";
  return format(parseISO(date), "MMM d, yyyy HH:mm")
}

export function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}
