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
