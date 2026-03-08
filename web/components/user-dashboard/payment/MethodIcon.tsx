"use client"

import {
  Wallet,
  Smartphone,
  Building,
  Landmark,
  Coins,
  CreditCard,
} from "lucide-react"

const methodIcons = {
  WALLET: Wallet,
  TELEBIRR: Smartphone,
  CBE: Building,
  BANK_TRANSFER: Landmark,
  CASH: Coins,
}

interface MethodIconProps {
  method: string
  className?: string
}

export function MethodIcon({ method, className = "w-4 h-4" }: MethodIconProps) {
  const Icon = methodIcons[method as keyof typeof methodIcons] || CreditCard
  return <Icon className={className} />
}
