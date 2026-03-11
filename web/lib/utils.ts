import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrencyIntl(amount, currency = "ETB") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "code", // shows ETB instead of symbol
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
type PaymentInput = {
  baseAmount: number | string // Price per passenger
  passengers?: number // Number of tickets (default 1)
  vatRate?: number // VAT rate as decimal (default 0.15)
  serviceFee?: number // Fixed service fee (default 10)
  discount?: number // Optional discount (default 0)
}

export function calculatePayment({
  baseAmount,
  passengers = 1,
  vatRate = 0.1,
  serviceFee = 4,
  discount = 0,
}: PaymentInput): number {
  baseAmount = Number(baseAmount)

  const subtotal = baseAmount * passengers
  const subtotalAfterDiscount = subtotal - discount
  const vatAmount = subtotalAfterDiscount * vatRate
  const totalAmount = subtotalAfterDiscount + vatAmount + serviceFee

  return totalAmount
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return Math.round(d * 10) / 10
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  return `${km.toFixed(1)} km`
}
