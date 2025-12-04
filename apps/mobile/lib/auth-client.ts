import { expoClient } from "@better-auth/expo/client"
import { emailOTPClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import * as SecureStore from "expo-secure-store"

export const authClient = createAuthClient({
  baseURL: "http://10.18.95.26:3001",
  plugins: [
    expoClient({
      scheme: "mobile",
      storagePrefix: "mobile",
      storage: SecureStore,
    }),
    emailOTPClient(),
  ],
})
