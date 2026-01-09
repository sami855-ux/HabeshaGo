import * as SecureStore from "expo-secure-store"

export const saveRefreshToken = async (token) => {
  await SecureStore.setItemAsync("refreshToken", token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  })
}

export const getRefreshToken = async () => {
  return await SecureStore.getItemAsync("refreshToken")
}

export const removeRefreshToken = async () => {
  await SecureStore.deleteItemAsync("refreshToken")
}
