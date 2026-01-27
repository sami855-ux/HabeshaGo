import { axiosInstance } from "@/services/axiosInstance"

export const getWalletTransactions = async () => {
  try {
    const response = await axiosInstance.get("/wallet/transactions")
    return response.data.data
  } catch (error) {
    console.error("Error fetching wallet transactions:", error)
    return null
  }
}

export const getUserWallet = async () => {
  try {
    const response = await axiosInstance.get("/wallet/me")
    return response.data.data
  } catch (error) {
    console.error("Error fetching user wallet:", error)
    return null
  }
}

export const createUserWallet = async (pin: string) => {
  try {
    const response = await axiosInstance.post("/wallet/create", { pin })
    return response.data.data
  } catch (error) {
    console.error("Error creating user wallet:", error)
    return null
  }
}

export const updateBiometricAPI = async (enable: boolean) => {
  try {
    const response = await axiosInstance.patch("/wallet/biometric", { enable })
    return response.data.data
  } catch (error) {
    console.error("Error updating biometric setting:", error)
    return null
  }
}

export const changePinAPI = async (currentPin: string, newPin: string) => {
  try {
    const response = await axiosInstance.patch("/wallet/change-pin", {
      currentPin,
      newPin,
    })

    console.log(response)
    return {
      success: response.data.success,
      message: response.data.message,
      wallet: response.data.data,
    }
  } catch (error) {
    console.error("Error changing wallet PIN:", error)
    return null
  }
}
