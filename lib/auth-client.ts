import * as SecureStore from "expo-secure-store"

const BASE_URL = "https://addis-pulse-2.onrender.com"

// SEND OTP
export async function sendOtp(email: string) {
  const cleanEmail = email.trim().toLowerCase()

  const res = await fetch(
    `${BASE_URL}/api/auth/email-otp/send-verification-otp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: cleanEmail,
        type: "sign-in", // MUST MATCH VERIFY
      }),
    }
  )

  const data = await res.json()
  console.log("SEND OTP RESPONSE:", data)

  if (!res.ok) {
    console.error("SEND OTP ERROR:", data)
    throw new Error(data.message || "Failed to send OTP")
  }

  return data
}

// VERIFY OTP (MOBILE FIXED)
export async function verifyOtp(email: string, code: string) {
  const cleanEmail = email.trim().toLowerCase()
  const cleanOtp = String(code).replace(/\D/g, "").trim()

  const res = await fetch(`${BASE_URL}/api/auth/sign-in/email-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      email: cleanEmail,
      otp: cleanOtp,
      type: "sign-in",
    }),
  })

  const data = await res.json()
  console.log("VERIFY RESPONSE:", data)

  if (!res.ok) {
    throw new Error(data.message || "Invalid or expired OTP")
  }

  if (data.token) {
    await SecureStore.setItemAsync("auth_token", data.token)
  }

  return data
}

// ✅ LOGOUT
export async function logout() {
  await SecureStore.deleteItemAsync("auth_token")
}

// ✅ GET TOKEN
export async function getToken() {
  return SecureStore.getItemAsync("auth_token")
}
