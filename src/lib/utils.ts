import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "Rs."): string {
  return `${currency} ${amount.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function displayProductName(name: string): string {
  return name
    .replace(/^Urban Special Pasta/, 'Special Pasta')
    .replace(/^Urban Special Sandwich/, 'Special Sandwich')
    .replace(/^Malai Boti Sandwich/, 'Creamy Sandwich')
    .replace(/^Crunchy Crunch Sandwich/, 'Crunchy Sandwich')
    .replace(/^Urban Special Burger/, 'Special (Zinger) Burger');
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatShortTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function generateInvoiceNumber(prefix: string = "INV-2026", count: number = 1): string {
  const pad = String(count).padStart(6, "0");
  return `${prefix}-${pad}`;
}

export function isValidObjectId(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export function getLocalDateKey(date: Date = new Date()): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
