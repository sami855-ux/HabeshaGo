export type UserRole = "PASSENGER" | "ADMIN" | "DRIVER"

export interface User {
  id: string
  name?: string | null
  email?: string | null
  password?: string | null
  phone?: string | null
  role: UserRole
  provider?: string | null
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: string
  updatedAt: string
}
