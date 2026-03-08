export interface ProfileData {
  name: string
  email: string
  phone: string
  avatarUrl: string
  bio: string
  location: string
  language: string
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
  pendingEmailVerification?: boolean
}

export interface ProfilePanelProps {
  userId?: string
}
