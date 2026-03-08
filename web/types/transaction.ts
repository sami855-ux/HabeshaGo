export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
  REFUND = "REFUND",
  ADJUSTMENT = "ADJUSTMENT",
  TRANSFER_OUT = "TRANSFER_OUT",
  TRANSFER_IN = "TRANSFER_IN",
  PAYMENT_OUT = "PAYMENT_OUT",
  PAYMENT_IN = "PAYMENT_IN",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  REVERSED = "REVERSED",
}

export interface WalletTransactionDTO {
  id: number
  walletId: number
  amount: string // Decimal comes as string
  balanceAfter: string // Decimal comes as string
  type: TransactionType
  status: TransactionStatus
  reference: string
  description?: string | null
  metadata?: Record<string, any> | null
  createdAt: string // ISO string
  recipientName: string | null
}
