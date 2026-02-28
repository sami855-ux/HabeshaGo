export interface Payment {
  id: number
  userId: string
  amount: number
  currency: string
  method: string
  gateway: string
  flow: string
  pointsUsed: number | null
  pointsValue: number | null
  status: string
  gatewayRef: string | null
  reference: string
  metadata: any
  walletId: number | null
  minibusReservationId: number | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name?: string
    email: string
  }
  wallet?: {
    id: number
    balance: number
  } | null
}

export interface Filters {
  status: string[]
  method: string[]
  flow: string[]
  dateRange: { from: string; to: string }
  amountRange: { min: string; max: string }
  gateway: string[]
  currency: string[]
}

export interface ConfirmDialogState {
  isOpen: boolean
  title: string
  message: string
  action: string
  type?: "danger" | "warning" | "info"
}

export type BulkAction =
  | "delete"
  | "refund"
  | "cancel"
  | "export"
  | "archive"
  | "print"
  | "email"
  | "export-csv"
  | "tag"
  | "verify"
