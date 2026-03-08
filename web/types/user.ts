export interface User {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  avaterUrl: string | null
  bio: string | null
  location: string | null

  role: "PASSENGER" | "DRIVER" | "ADMIN"

  emailVerified: boolean
  phoneVerified: boolean
  twoFactorEnabled: boolean

  isSuspended: boolean
  suspendedAt: string | null
  suspendedBy: string | null
  suspensionReason: string | null

  createdAt: string
  updatedAt: string

  // Relations (lightweight)
  wallet?: Wallet | null
  bookings?: Booking[]
  minibusReservations?: MinibusReservation[]
  parkingReservations?: ParkingReservation[]
  sessions?: Session[]
  accounts?: Account[]
}

export interface Wallet {
  id: number
  balance: number
  currency: string
  isActive?: boolean
  isLocked?: boolean
  points?: number
  pinHash?: string | null
  biometricEnabled?: boolean
  biometricToken?: string | null
  pinAttempts?: number
  createdAt?: string
  updatedAt?: string
  userId?: string
}

export interface Session {
  id: string
  expiresAt: string
  createdAt: string
}

export interface Account {
  id: string
  provider: string
  providerAccountId: string
}

export interface Booking {
  id: number
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  createdAt: string
}

export interface MinibusReservation {
  id: number
  seat: number
  date: string
  status: "PENDING" | "CONFIRMED" | "CANCELLED"
}

export interface ParkingReservation {
  id: number
  slotNumber: number
  startTime: string
  endTime: string
}

// For table display
export type UserStatus = "active" | "suspended" | "inactive"
export type UserTableData = User & {
  tableStatus: UserStatus
  lastLogin?: string
}

export type UserRole = "PASSENGER" | "DRIVER" | "ADMIN"

// Theme types
export type Theme = "light" | "dark" | "system"
export type BadgeTheme = "default" | "light" | "dark" | "colorful"

export interface ProfileData {
  name: string
  email: string
  phone: string
  avatarUrl: string
  bio?: string
  location?: string
  language?: string
  isPhoneVerified: boolean
  isEmailVerified: boolean
}

export interface VerificationState {
  isVerifying: boolean
  verificationCode: string
  timerActive: boolean
  canResend: boolean
  attempts: number
  verificationMethod: "sms" | "call" | "email"
  currentVerificationType: "phone" | "email" | null
  tempValue: string
}

export type UserByPhoneResponse = {
  id: string
  name: string
  phone: string | null
  isVerified: boolean
}
