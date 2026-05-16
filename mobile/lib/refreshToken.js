import * as SecureStore from "expo-secure-store"

export const saveRefreshToken = async (token) => {
  try {
    console.log("Saving refresh token...")

    await SecureStore.setItemAsync("refreshToken", token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    })

    console.log("✅ Refresh token saved successfully")
    console.log("Saved token:", token)
  } catch (error) {
    console.log("❌ Error saving refresh token:", error)
  }
}

export const getRefreshToken = async () => {
  return await SecureStore.getItemAsync("refreshToken")
}

export const removeRefreshToken = async () => {
  await SecureStore.deleteItemAsync("refreshToken")
}
